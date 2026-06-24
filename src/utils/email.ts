import nodemailer from 'nodemailer'
import { supabaseAdmin } from './supabase'

// Initialize the Nodemailer SMTP transporter using Amazon SES credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'email-smtp.ap-south-1.amazonaws.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465, // True for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Saves a notification send attempt log to the database.
 */
async function logNotification(
  orderId: string,
  email: string,
  recipientType: 'customer' | 'admin',
  subject: string,
  status: 'sent' | 'failed',
  errorMessage: string | null = null
): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('notification_logs')
      .insert([{
        order_id: orderId,
        recipient_email: email,
        recipient_type: recipientType,
        subject,
        status,
        error_message: errorMessage
      }])
    if (error) {
      console.error('[Email Log] Error saving notification log to Supabase:', error)
    }
  } catch (err) {
    console.error('[Email Log] Fatal error inserting notification log:', err)
  }
}


interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
}

/**
 * Sends order confirmation emails to the customer and store administrators.
 * Called automatically when an order status changes to "paid" (successful payment).
 */
export async function sendOrderEmails(orderId: string): Promise<boolean> {
  try {
    console.log(`[Email] Initiating email sending for order: ${orderId}`)

    // 1. Fetch Order Details
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) {
      console.error(`[Email] Failed to fetch order ${orderId}:`, orderErr)
      return false
    }

    // 2. Fetch Customer Details
    const { data: customer, error: customerErr } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', order.customer_id)
      .single()

    if (customerErr || !customer) {
      console.error(`[Email] Failed to fetch customer for order ${orderId}:`, customerErr)
      return false
    }

    // 3. Fetch Order Items
    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (itemsErr || !items) {
      console.error(`[Email] Failed to fetch order items for order ${orderId}:`, itemsErr)
      return false
    }

    // 4. Fetch Admin Emails
    const { data: admins, error: adminsErr } = await supabaseAdmin
      .from('admins')
      .select('email, name, receive_notifications')

    let adminEmails: string[] = []
    if (adminsErr) {
      console.warn(`[Email] Warning: Failed to query admins table:`, adminsErr)
      // Fallback to default admin email if query fails
      adminEmails = ['admin@zanka.shop']
    } else if (admins && admins.length > 0) {
      adminEmails = admins
        .filter(a => a.receive_notifications !== false)
        .map(a => a.email)
    }

    // If no active admins found, use a fallback address
    if (adminEmails.length === 0) {
      adminEmails = ['admin@zanka.shop']
    }

    const fromAddress = process.env.SMTP_FROM || '"Zanka Shop" <noreply@zanka.shop>'
    const totalAmount = order.amount
    const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Generate Order Items HTML table
    const itemsTableHtml = items
      .map(
        (item: OrderItem) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #222; color: #fff; font-size: 14px;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #222; color: #aaa; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #222; color: #e5212b; font-size: 14px; text-align: right; font-weight: bold;">₹${item.price}</td>
        <td style="padding: 12px; border-bottom: 1px solid #222; color: #e5212b; font-size: 14px; text-align: right; font-weight: bold;">₹${item.price * item.quantity}</td>
      </tr>`
      )
      .join('')

    // ----------------------------------------------------
    // EMAIL 1: CUSTOMER ORDER CONFIRMATION
    // ----------------------------------------------------
    if (customer.email) {
      const customerSubject = `Order Confirmed! Thank you for shopping with ZANKA (#${orderId.substring(0, 8).toUpperCase()})`
      const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #030303; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0c0c0c; border: 1px solid #222222; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px; background-color: #070707; border-bottom: 2px solid #e5212b;">
              <h1 style="margin: 0; font-size: 28px; letter-spacing: 0.25em; text-transform: uppercase; color: #ffffff; font-weight: 300;">ZANKA</h1>
              <span style="font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase; color: #e5212b; display: block; margin-top: 5px;">Order Confirmation</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #ddd; margin-top: 0;">Hey ${customer.name},</p>
              <p style="font-size: 14px; line-height: 1.6; color: #aaa;">Your order has been placed successfully. We are now processing your items and will notify you as soon as they are shipped.</p>
              
              <div style="background-color: rgba(229,33,43,0.1); border: 1px solid rgba(229,33,43,0.3); border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="font-size: 14px; color: #fff; margin: 0; font-weight: bold;">Estimated Delivery: 6 to 7 Business Days</p>
              </div>
              
              <!-- Order Details Summary Block -->
              <div style="background-color: #111111; border: 1px solid #222; border-radius: 4px; padding: 20px; margin: 30px 0;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="color: #ccc; font-size: 13px;">
                  <tr>
                    <td style="padding-bottom: 8px; font-weight: bold; color: #888;">Order ID:</td>
                    <td style="padding-bottom: 8px; text-align: right; color: #fff; font-family: monospace;">#${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; font-weight: bold; color: #888;">Order Date:</td>
                    <td style="padding-bottom: 8px; text-align: right; color: #fff;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; font-weight: bold; color: #888;">Payment Method:</td>
                    <td style="padding-bottom: 8px; text-align: right; color: #fff;">Razorpay Online</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: #888;">Payment ID:</td>
                    <td style="text-align: right; color: #fff; font-family: monospace;">${order.razorpay_payment_id || 'N/A'}</td>
                  </tr>
                </table>
              </div>

              <!-- Items Table -->
              <h3 style="font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: #fff; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 8px;">Order Details</h3>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background-color: #141414;">
                    <th style="padding: 10px 12px; text-align: left; color: #888; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid #222;">Item</th>
                    <th style="padding: 10px 12px; text-align: center; color: #888; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid #222; width: 60px;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; color: #888; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid #222; width: 80px;">Price</th>
                    <th style="padding: 10px 12px; text-align: right; color: #888; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid #222; width: 80px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsTableHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 15px 12px 5px; text-align: right; font-size: 14px; color: #888; font-weight: bold;">Grand Total:</td>
                    <td colspan="2" style="padding: 15px 12px 5px; text-align: right; font-size: 18px; color: #e5212b; font-weight: bold;">₹${totalAmount}</td>
                  </tr>
                </tfoot>
              </table>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://zanka.shop/order/${orderId}" style="background-color: #e5212b; color: #ffffff; text-decoration: none; padding: 14px 35px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.15em; display: inline-block; border-radius: 4px;">View Full Receipt & Order Status</a>
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #888; margin-bottom: 0;">If you have any questions regarding your order, feel free to reply directly to this email or contact support at <a href="mailto:support@zanka.shop" style="color: #e5212b; text-decoration: none;">support@zanka.shop</a>.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px; background-color: #070707; border-top: 1px solid #222; font-size: 11px; color: #555; letter-spacing: 0.05em;">
              &copy; ${new Date().getFullYear()} ZANKA Shop. All Rights Reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
      `

      console.log(`[Email] Sending confirmation to customer: ${customer.email}`)
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: customer.email,
          subject: customerSubject,
          html: customerHtml,
        })
        console.log(`[Email] Customer confirmation email sent successfully.`)
        await logNotification(orderId, customer.email, 'customer', customerSubject, 'sent')
      } catch (err: any) {
        console.error(`[Email] Customer confirmation email failed:`, err)
        await logNotification(
          orderId,
          customer.email,
          'customer',
          customerSubject,
          'failed',
          err.message || String(err)
        )
      }
    } else {
      console.log(`[Email] Customer email not found (only mobile: ${customer.mobile || 'N/A'}). Skipping customer email.`)
    }

    // ----------------------------------------------------
    // EMAIL 2: ADMIN NEW ORDER NOTIFICATION
    // ----------------------------------------------------
    const adminSubject = `[ALERT] New Order Placed - ZANKA (#${orderId.substring(0, 8).toUpperCase()})`
    const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Alert</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #030303; font-family: Arial, sans-serif; color: #ffffff;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0c0c0c; border: 1px solid #222222; margin: 20px auto; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 30px; background-color: #070707; border-bottom: 2px solid #e5212b;">
            <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff;">ZANKA ADMIN</h2>
            <span style="font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #e5212b; display: block; margin-top: 5px;">New Order Placed</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding: 30px;">
            <p style="font-size: 15px; color: #fff; margin-top: 0; font-weight: bold;">An order has been successfully placed and paid.</p>
            
            <!-- Customer info table -->
            <h3 style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; border-bottom: 1px solid #222; padding-bottom: 8px; margin-top: 25px;">Customer Details</h3>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="color: #ccc; font-size: 13px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 5px 0; color: #fff;">${customer.name}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Email:</td>
                <td style="padding: 5px 0; color: #fff;">${customer.email || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Mobile:</td>
                <td style="padding: 5px 0; color: #fff;">${customer.mobile || 'N/A'}</td>
              </tr>
            </table>

            <!-- Order info table -->
            <h3 style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; border-bottom: 1px solid #222; padding-bottom: 8px; margin-top: 25px;">Order Details</h3>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="color: #ccc; font-size: 13px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold; width: 120px;">Order ID:</td>
                <td style="padding: 5px 0; color: #fff; font-family: monospace;">#${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Amount Paid:</td>
                <td style="padding: 5px 0; color: #e5212b; font-weight: bold; font-size: 14px;">₹${totalAmount}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Razorpay Payment:</td>
                <td style="padding: 5px 0; color: #fff; font-family: monospace;">${order.razorpay_payment_id || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Date/Time:</td>
                <td style="padding: 5px 0; color: #fff;">${formattedDate}</td>
              </tr>
            </table>

            <!-- Items -->
            <h3 style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; border-bottom: 1px solid #222; padding-bottom: 8px; margin-top: 25px;">Products Purchased</h3>
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 30px;">
              <thead>
                <tr style="background-color: #141414;">
                  <th style="padding: 8px; text-align: left; color: #666; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #222;">Item</th>
                  <th style="padding: 8px; text-align: center; color: #666; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #222; width: 50px;">Qty</th>
                  <th style="padding: 8px; text-align: right; color: #666; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #222; width: 80px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item: OrderItem) => `
                <tr>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #222; color: #fff; font-size: 13px;">${item.product_name}</td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #222; color: #aaa; font-size: 13px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #222; color: #e5212b; font-size: 13px; text-align: right;">₹${item.price * item.quantity}</td>
                </tr>`
                  )
                  .join('')}
              </tbody>
            </table>

            <div align="center" style="margin-top: 30px;">
              <a href="https://zanka.shop/admin" style="background-color: #e5212b; color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; display: inline-block; border-radius: 2px;">Open Admin Panel</a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 20px; background-color: #070707; border-top: 1px solid #222; font-size: 10px; color: #555;">
            Notification sent automatically by ZANKA Server.
          </td>
        </tr>
      </table>
    </body>
    </html>
    `

    console.log(`[Email] Sending alert notifications to admins: ${adminEmails.join(', ')}`)
    
    // Send to admins concurrently and log each outcome
    const adminPromises = adminEmails.map(async (email) => {
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: adminSubject,
          html: adminHtml,
        })
        await logNotification(orderId, email, 'admin', adminSubject, 'sent')
      } catch (err: any) {
        console.error(`[Email] Admin alert failed for ${email}:`, err)
        await logNotification(
          orderId,
          email,
          'admin',
          adminSubject,
          'failed',
          err.message || String(err)
        )
      }
    })

    await Promise.all(adminPromises)
    console.log(`[Email] All admin notifications sent and logged.`)
    return true
  } catch (error) {
    console.error(`[Email] Fatal error sending order emails:`, error)
    return false
  }
}
