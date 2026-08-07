import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, BUCKET_NAME } from '@/utils/supabase'
import { withSupabase } from '@supabase/server'

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const categoryId = (formData.get('category_id') as string | null) || null

    if (!files || files.length === 0) {
      return Response.json({ error: 'No files provided for upload' }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const uploadedMedia: any[] = []
    const dbRecords: any[] = []

    for (const file of files) {
      if (!file || typeof file === 'string') continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Standardize file name
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 7)
      const key = `media/${timestamp}_${randomSuffix}_${cleanFileName}`

      // Upload to Supabase Storage S3 Endpoint
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type || 'image/jpeg',
        })
      )

      // Formulate public CDN URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${key}`

      dbRecords.push({
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || 'image/jpeg',
        image_url: publicUrl,
        category_id: categoryId && categoryId !== 'all' ? categoryId : null,
      })
    }

    if (dbRecords.length > 0) {
      const { data: insertedData, error: dbErr } = await ctx.supabaseAdmin
        .from('media_library')
        .insert(dbRecords)
        .select()

      if (dbErr) {
        console.error('Failed to insert media_library records:', dbErr)
        throw dbErr
      }

      uploadedMedia.push(...(insertedData || []))
    }

    return Response.json({
      success: true,
      message: `Successfully uploaded ${uploadedMedia.length} image(s)`,
      media: uploadedMedia,
    })
  } catch (error: any) {
    console.error('Bulk Upload API error:', error)
    return Response.json({ error: error.message || 'Bulk image upload failed' }, { status: 500 })
  }
})
