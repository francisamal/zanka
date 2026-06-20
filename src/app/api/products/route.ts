import { withSupabase } from '@supabase/server'

export const GET = withSupabase({ auth: 'none' }, async (req, ctx) => {
  try {
    const { data: categories, error: catError } = await ctx.supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (catError) throw catError

    const { data: products, error: prodError } = await ctx.supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (prodError) throw prodError

    return Response.json({ categories, products })
  } catch (error: any) {
    console.error('API Error in GET /api/products:', error)
    return Response.json({ error: error.message || 'Failed to fetch products' }, { status: 500 })
  }
})
