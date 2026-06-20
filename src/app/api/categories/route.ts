import { withSupabase } from '@supabase/server'

export const GET = withSupabase({ auth: 'none' }, async (req, ctx) => {
  try {
    const { data, error } = await ctx.supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return Response.json(data)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

export const POST = withSupabase({ auth: 'none' }, async (req, ctx) => {
  try {
    const { name, slug } = await req.json()
    if (!name || !slug) {
      return Response.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const { data, error } = await ctx.supabaseAdmin
      .from('categories')
      .insert([{ name, slug }])
      .select()
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

export const DELETE = withSupabase({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await ctx.supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
