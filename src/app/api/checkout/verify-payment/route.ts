import { withSupabase } from '@supabase/server'
import crypto from 'crypto'
import { sendOrderEmails } from '../../../../utils/email'

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json()

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return Response.json({ error: 'All payment parameters are required' }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'hFv0NpoYQL3d3hC4WZ5ntibQ'

    // Verify signature signature = hmac_sha256(razorpay_order_id + "|" + razorpay_payment_id, secret)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex')

    const isAuthentic = expectedSignature === razorpaySignature

    if (isAuthentic) {
      // Update order status to paid, save payment ID & signature
      const { error } = await ctx.supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature
        })
        .eq('id', orderId)

      if (error) throw error

      // Trigger email notifications via Amazon SES
      try {
        await sendOrderEmails(orderId)
      } catch (emailError) {
        console.error('Error triggering order emails:', emailError)
      }

      return Response.json({ success: true, message: 'Payment verified successfully' })
    } else {
      // Update status to failed
      await ctx.supabaseAdmin
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId)

      return Response.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Error in POST /api/checkout/verify-payment:', error)
    return Response.json({ error: error.message || 'Signature verification failed' }, { status: 500 })
  }
})
