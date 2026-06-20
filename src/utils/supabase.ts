import { createClient } from '@supabase/supabase-js'
import { S3Client } from '@aws-sdk/client-s3'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

// Supabase server client using the service role key for admin privileges
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
    },
  }
)

// S3 client configured for Supabase S3-compatible storage
const s3Endpoint = process.env.SUPABASE_STORAGE_ENDPOINT
const s3Region = process.env.SUPABASE_STORAGE_REGION
const s3AccessKeyId = process.env.SUPABASE_STORAGE_ACCESS_KEY_ID
const s3SecretAccessKey = process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY

export const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: s3Region || 'ap-northeast-2',
  credentials: {
    accessKeyId: s3AccessKeyId || '',
    secretAccessKey: s3SecretAccessKey || '',
  },
  forcePathStyle: true,
})

export const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'zanka-objects-directory'
