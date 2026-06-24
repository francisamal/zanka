import { withSupabase } from '@supabase/server'

export const GET = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    // 1. Fetch all orders ordered by creation date
    const { data: orders, error: ordersErr } = await ctx.supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersErr) throw ordersErr

    if (!orders || orders.length === 0) {
      return Response.json({ orders: [] })
    }

    // 2. Fetch all customers associated with these orders
    const customerIds = Array.from(new Set(orders.map((o: any) => o.customer_id).filter(Boolean)))
    let customers: any[] = []
    if (customerIds.length > 0) {
      const { data: custData, error: custErr } = await ctx.supabaseAdmin
        .from('customers')
        .select('*')
        .in('id', customerIds)
      if (custErr) throw custErr
      customers = custData || []
    }

    // 3. Fetch all order items associated with these orders
    const orderIds = orders.map((o: any) => o.id)
    let orderItems: any[] = []
    if (orderIds.length > 0) {
      const { data: itemsData, error: itemsErr } = await ctx.supabaseAdmin
        .from('order_items')
        .select('*')
        .in('order_id', orderIds)
      if (itemsErr) throw itemsErr
      orderItems = itemsData || []
    }

    // 4. Combine data
    const detailedOrders = orders.map((order: any) => {
      const customer = customers.find((c: any) => c.id === order.customer_id) || null
      const items = orderItems.filter((item: any) => item.order_id === order.id)
      return {
        ...order,
        customer,
        items
      }
    })

    return Response.json({ orders: detailedOrders })
  } catch (error: any) {
    console.error('API Error in GET /api/admin/orders:', error)
    return Response.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 })
  }
})

export const PUT = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { orderId, status } = await req.json()

    if (!orderId || !status) {
      return Response.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    // Update order status
    const { data: updatedOrder, error } = await ctx.supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error

    return Response.json(updatedOrder)
  } catch (error: any) {
    console.error('API Error in PUT /api/admin/orders:', error)
    return Response.json({ error: error.message || 'Failed to update order' }, { status: 500 })
  }
})

export const DELETE = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const { error } = await ctx.supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true, message: 'Order deleted successfully' })
  } catch (error: any) {
    console.error('API Error in DELETE /api/admin/orders:', error)
    return Response.json({ error: error.message || 'Failed to delete order' }, { status: 500 })
  }
})
