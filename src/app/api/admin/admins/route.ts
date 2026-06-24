import { withSupabase } from '@supabase/server'

export const GET = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { data: admins, error } = await ctx.supabaseAdmin
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return Response.json({ admins })
  } catch (error: any) {
    console.error('API Error in GET /api/admin/admins:', error)
    return Response.json({ error: error.message || 'Failed to fetch admins' }, { status: 500 })
  }
})

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { email, name, receive_notifications } = await req.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: admin, error } = await ctx.supabaseAdmin
      .from('admins')
      .insert([{
        email,
        name,
        receive_notifications: receive_notifications !== false
      }])
      .select()
      .single()

    if (error) throw error

    return Response.json(admin)
  } catch (error: any) {
    console.error('API Error in POST /api/admin/admins:', error)
    return Response.json({ error: error.message || 'Failed to create admin' }, { status: 500 })
  }
})

export const DELETE = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Admin ID is required' }, { status: 400 })
    }

    const { error } = await ctx.supabaseAdmin
      .from('admins')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true, message: 'Admin deleted successfully' })
  } catch (error: any) {
    console.error('API Error in DELETE /api/admin/admins:', error)
    return Response.json({ error: error.message || 'Failed to delete admin' }, { status: 500 })
  }
})
