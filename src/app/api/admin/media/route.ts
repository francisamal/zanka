import { withSupabase } from '@supabase/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, BUCKET_NAME } from '@/utils/supabase'

export const GET = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('category_id')

    let query = ctx.supabaseAdmin
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false })

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error) throw error
    return Response.json({ media: data || [] })
  } catch (error: any) {
    console.error('GET /api/admin/media error:', error)
    return Response.json({ error: error.message || 'Failed to fetch media library' }, { status: 500 })
  }
})

export const DELETE = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Media ID is required' }, { status: 400 })
    }

    // First fetch the record to get the image_url
    const { data: mediaItem, error: fetchErr } = await ctx.supabaseAdmin
      .from('media_library')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !mediaItem) {
      return Response.json({ error: 'Media item not found' }, { status: 404 })
    }

    // Try deleting S3 object if URL matches standard format
    try {
      const urlParts = mediaItem.image_url.split(`/${BUCKET_NAME}/`)
      if (urlParts.length > 1) {
        const key = urlParts[1]
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          })
        )
      }
    } catch (s3Err) {
      console.warn('Failed to delete S3 storage object:', s3Err)
    }

    // Delete record from DB
    const { error: deleteErr } = await ctx.supabaseAdmin
      .from('media_library')
      .delete()
      .eq('id', id)

    if (deleteErr) throw deleteErr

    return Response.json({ success: true, message: 'Media item deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/admin/media error:', error)
    return Response.json({ error: error.message || 'Failed to delete media item' }, { status: 500 })
  }
})
