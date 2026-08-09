import { withSupabase } from '@supabase/server'

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const body = await req.json()
    const { id, action } = body // id can be product ID or slug, action: 'like' | 'unlike'

    if (!id) {
      return Response.json({ error: 'Product ID or slug is required' }, { status: 400 })
    }

    // Fetch existing product record
    const { data: prod, error: fetchErr } = await ctx.supabaseAdmin
      .from('products')
      .select('id, slug, likes')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single()

    if (fetchErr || !prod) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    const currentLikes = prod.likes || 0
    const nextLikes = action === 'unlike' ? Math.max(0, currentLikes - 1) : currentLikes + 1

    const { data: updated, error: updateErr } = await ctx.supabaseAdmin
      .from('products')
      .update({ likes: nextLikes })
      .eq('id', prod.id)
      .select('id, slug, likes')
      .single()

    if (updateErr) throw updateErr

    return Response.json({ success: true, likes: updated.likes })
  } catch (error: any) {
    console.error('API Error in POST /api/products/like:', error)
    return Response.json({ error: error.message || 'Failed to update likes' }, { status: 500 })
  }
})
