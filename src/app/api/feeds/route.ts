import { withSupabase } from '@supabase/server'

export const GET = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'reviews', 'posts', or null for both

    let reviews: any[] | null = null
    let posts: any[] | null = null

    if (type === 'reviews' || !type) {
      const { data, error: reviewsErr } = await ctx.supabaseAdmin
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (reviewsErr) throw reviewsErr
      reviews = data
    }

    if (type === 'posts' || !type) {
      const { data, error: postsErr } = await ctx.supabaseAdmin
        .from('community_posts')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (postsErr) throw postsErr
      posts = data
    }

    return Response.json({
      reviews: reviews ?? [],
      posts: posts ?? [],
    })
  } catch (error: any) {
    console.error('API Error in GET /api/feeds:', error)
    return Response.json({ error: error.message || 'Failed to fetch feeds' }, { status: 500 })
  }
})

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const body = await req.json()
    const { type } = body

    if (type === 'review') {
      const { customer_name, rating, review_text, product_name, image_url } = body

      if (!customer_name || !review_text || !rating) {
        return Response.json(
          { error: 'Name, rating, and review text are required' },
          { status: 400 }
        )
      }

      if (rating < 1 || rating > 5) {
        return Response.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        )
      }

      const { data, error } = await ctx.supabaseAdmin
        .from('reviews')
        .insert([{
          customer_name: customer_name.trim(),
          rating: Math.round(rating),
          review_text: review_text.trim(),
          product_name: product_name?.trim() || null,
          image_url: image_url?.trim() || null,
          is_approved: true,
        }])
        .select()
        .single()

      if (error) throw error
      return Response.json({ success: true, data })

    } else if (type === 'post') {
      const { author_name, content, instagram_handle, image_url } = body

      if (!author_name || !content) {
        return Response.json(
          { error: 'Name and content are required' },
          { status: 400 }
        )
      }

      const { data, error } = await ctx.supabaseAdmin
        .from('community_posts')
        .insert([{
          author_name: author_name.trim(),
          content: content.trim(),
          instagram_handle: instagram_handle?.trim() || null,
          image_url: image_url?.trim() || null,
          is_approved: true,
        }])
        .select()
        .single()

      if (error) throw error
      return Response.json({ success: true, data })

    } else {
      return Response.json(
        { error: 'Type must be "review" or "post"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('API Error in POST /api/feeds:', error)
    return Response.json({ error: error.message || 'Failed to submit' }, { status: 500 })
  }
})
