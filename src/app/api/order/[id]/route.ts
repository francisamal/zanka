import { createSupabaseContext } from '@supabase/server'

export async function GET(req: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params
    const orderId = resolvedParams.id

    if (!orderId) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const { data: ctx, error: authError } = await createSupabaseContext(req, { auth: 'none' })
    if (authError || !ctx) {
      return Response.json({ error: authError?.message || 'Unauthorized' }, { status: 401 })
    }

    const { data: order, error } = await ctx.supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        amount,
        created_at,
        shipping_address,
        pincode,
        razorpay_payment_id,
        customers (
          name,
          email,
          mobile
        ),
        order_items (
          product_name,
          quantity,
          price
        )
      `)
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    return Response.json(order)
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return Response.json({ error: 'Failed to fetch order details' }, { status: 500 })
  }
}
