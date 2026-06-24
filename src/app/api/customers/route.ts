import { withSupabase } from '@supabase/server'

export const POST = withSupabase<any>({ auth: 'none' }, async (req, ctx) => {
  try {
    const { name, email, mobile, address, pincode } = await req.json()
    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email && !mobile) {
      return Response.json({ error: 'Email or Mobile number is required' }, { status: 400 })
    }

    // Check if customer exists by email or mobile
    let existingCustomer = null

    if (email) {
      const { data, error } = await ctx.supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', email)
        .maybeSingle()
      if (error) throw error
      existingCustomer = data
    }

    if (!existingCustomer && mobile) {
      const { data, error } = await ctx.supabaseAdmin
        .from('customers')
        .select('*')
        .eq('mobile', mobile)
        .maybeSingle()
      if (error) throw error
      existingCustomer = data
    }

    if (existingCustomer) {
      // Update name or details if they changed
      const updateFields: any = {}
      if (existingCustomer.name !== name) {
        updateFields.name = name
      }
      if (email && existingCustomer.email !== email) {
        updateFields.email = email
      }
      if (mobile && existingCustomer.mobile !== mobile) {
        updateFields.mobile = mobile
      }
      if (address && existingCustomer.address !== address) {
        updateFields.address = address
      }
      if (pincode && existingCustomer.pincode !== pincode) {
        updateFields.pincode = pincode
      }

      if (Object.keys(updateFields).length > 0) {
        const { data, error } = await ctx.supabaseAdmin
          .from('customers')
          .update(updateFields)
          .eq('id', existingCustomer.id)
          .select()
          .single()
        if (error) throw error
        return Response.json(data)
      }
      return Response.json(existingCustomer)
    }

    // Create new customer
    const { data, error } = await ctx.supabaseAdmin
      .from('customers')
      .insert([{ name, email: email || null, mobile: mobile || null, address: address || null, pincode: pincode || null }])
      .select()
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (error: any) {
    console.error('Error in POST /api/customers:', error)
    return Response.json({ error: error.message || 'Failed to sign in' }, { status: 500 })
  }
})
