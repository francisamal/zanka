import { withSupabase } from '@supabase/server'
import Razorpay from 'razorpay'

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { customerId, items, shippingAddress, pincode, comments } = await req.json()

    if (!customerId) {
      return Response.json({ error: 'Customer ID is required' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart items are required' }, { status: 400 })
    }

    // 1. Fetch products from database to verify and calculate prices
    const productSlugs = items.map((item: any) => item.id)
    const { data: dbProducts, error: prodError } = await ctx.supabaseAdmin
      .from('products')
      .select('*')
      .in('slug', productSlugs)

    if (prodError) throw prodError
    if (!dbProducts || dbProducts.length === 0) {
      return Response.json({ error: 'No matching products found in database' }, { status: 400 })
    }

    // 2. Compute total price
    let totalAmount = 0
    const verifiedItems = items.map((item: any) => {
      const dbProd = dbProducts.find((p: any) => p.slug === item.id)
      if (!dbProd) {
        throw new Error(`Product ${item.name} not found in store database.`)
      }
      const price = dbProd.price_inr
      totalAmount += price * item.quantity
      return {
        product_id: dbProd.slug,
        product_name: dbProd.name,
        quantity: item.quantity,
        price: price
      }
    })

    // 3. Create order record in our database
    const { data: order, error: orderError } = await ctx.supabaseAdmin
      .from('orders')
      .insert([{
        customer_id: customerId,
        amount: totalAmount,
        status: 'pending',
        shipping_address: shippingAddress || null,
        pincode: pincode || null,
        comments: comments || null
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // 4. Create order items record in our database
    const orderItemsToInsert = verifiedItems.map((item: any) => ({
      order_id: order.id,
      ...item
    }))

    const { error: itemsError } = await ctx.supabaseAdmin
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) throw itemsError

    // 5. Create Razorpay order
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TMvQ6n9RqDdV8O'
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'hFv0NpoYQL3d3hC4WZ5ntibQ'

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: totalAmount * 100, // Razorpay amount in paise
      currency: 'INR',
      receipt: `receipt_order_${order.id.substring(0, 10)}`,
    }

    const rzpOrder = await razorpay.orders.create(options)

    // 6. Update our order with the Razorpay order ID
    const { error: updateError } = await ctx.supabaseAdmin
      .from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', order.id)

    if (updateError) throw updateError

    // 7. Return details to client
    return Response.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: options.amount,
      currency: options.currency
    })

  } catch (error: any) {
    console.error('Error in POST /api/checkout/create-order:', error)
    return Response.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
})
