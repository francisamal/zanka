import { withSupabase } from '@supabase/server'

export const GET = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { data: logs, error } = await ctx.supabaseAdmin
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100) // Retrieve the last 100 entries for efficiency

    if (error) throw error

    return Response.json({ logs })
  } catch (error: any) {
    console.error('API Error in GET /api/admin/notification-logs:', error)
    return Response.json({ error: error.message || 'Failed to fetch logs' }, { status: 500 })
  }
})

export const DELETE = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      // Delete a specific log entry
      const { error } = await ctx.supabaseAdmin
        .from('notification_logs')
        .delete()
        .eq('id', id)
      if (error) throw error
      return Response.json({ success: true, message: 'Log deleted' })
    } else {
      // Clear all logs by matching all rows (excluding dummy UUIDs if not matched, using a general condition)
      const { error } = await ctx.supabaseAdmin
        .from('notification_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Matches all UUIDs
      if (error) throw error
      return Response.json({ success: true, message: 'All logs cleared' })
    }
  } catch (error: any) {
    console.error('API Error in DELETE /api/admin/notification-logs:', error)
    return Response.json({ error: error.message || 'Failed to clear logs' }, { status: 500 })
  }
})
