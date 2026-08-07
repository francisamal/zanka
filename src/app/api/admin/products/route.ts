import { withSupabase } from '@supabase/server'

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const body = await req.json()
    const { name, slug, description, price_inr, price_usd, image_url, images, tag, category_id, is_sold_out } = body

    const productImages = Array.isArray(images) && images.length > 0 ? images : (image_url ? [image_url] : [])
    const primaryImageUrl = image_url || (productImages.length > 0 ? productImages[0] : '')

    if (!name || !slug || price_inr === undefined || price_usd === undefined || !primaryImageUrl) {
      return Response.json({ error: 'Name, slug, price INR, price USD, and at least one image are required' }, { status: 400 })
    }

    const { data, error } = await ctx.supabaseAdmin
      .from('products')
      .insert([{
        name,
        slug,
        description,
        price_inr: parseFloat(price_inr),
        price_usd: parseFloat(price_usd),
        image_url: primaryImageUrl,
        images: productImages,
        tag,
        category_id: category_id || null,
        is_sold_out: Boolean(is_sold_out)
      }])
      .select()
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (error: any) {
    console.error('API Error in POST /api/admin/products:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
})

export const PUT = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const body = await req.json()
    const { id, name, slug, description, price_inr, price_usd, image_url, images, tag, category_id, is_sold_out } = body

    if (!id) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const updateFields: any = {}
    if (name !== undefined) updateFields.name = name
    if (slug !== undefined) updateFields.slug = slug
    if (description !== undefined) updateFields.description = description
    if (price_inr !== undefined) updateFields.price_inr = parseFloat(price_inr)
    if (price_usd !== undefined) updateFields.price_usd = parseFloat(price_usd)
    if (images !== undefined && Array.isArray(images)) {
      updateFields.images = images
      if (images.length > 0) {
        updateFields.image_url = images[0]
      }
    }
    if (image_url !== undefined) updateFields.image_url = image_url
    if (tag !== undefined) updateFields.tag = tag
    if (category_id !== undefined) updateFields.category_id = category_id || null
    if (is_sold_out !== undefined) updateFields.is_sold_out = Boolean(is_sold_out)

    const { data, error } = await ctx.supabaseAdmin
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (error: any) {
    console.error('API Error in PUT /api/admin/products:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
})

export const DELETE = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const { error } = await ctx.supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return Response.json({ success: true })
  } catch (error: any) {
    console.error('API Error in DELETE /api/admin/products:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
})
