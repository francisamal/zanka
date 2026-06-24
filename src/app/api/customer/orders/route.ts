import { withSupabase } from '@supabase/server'

export const GET = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return Response.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // Fetch orders for this customer
    const { data: orders, error } = await ctx.supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        amount,
        created_at,
        shipping_address,
        pincode,
        order_items (
          product_name,
          quantity,
          price
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json(orders)
  } catch (error: any) {
    console.error('Error fetching customer orders:', error)
    return Response.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 })
  }
})
