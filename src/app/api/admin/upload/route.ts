import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, BUCKET_NAME } from '@/utils/supabase'
import { withSupabase } from '@supabase/server'

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Standardize file name
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const timestamp = Date.now()
    const key = `products/${timestamp}_${cleanFileName}`

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
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${key}`

    return Response.json({ url: publicUrl })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return Response.json({ error: error.message || 'Image upload failed' }, { status: 500 })
  }
})
