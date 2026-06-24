'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Cursor from '@/components/Cursor'

interface OrderDetail {
  id: string
  status: string
  amount: number
  created_at: string
  shipping_address: string
  pincode: string
  razorpay_payment_id: string
  customers: {
    name: string
    email: string
    mobile: string
  }
  order_items: {
    product_name: string
    quantity: number
    price: number
  }[]
}

export default function OrderReceiptPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetch(`/api/order/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Order not found')
          return res.json()
        })
        .then(data => {
          setOrder(data)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [id])

  if (loading) {
    return (
      <main className="bg-bg text-cream min-h-screen flex flex-col items-center relative">
        <Cursor />
        <div className="w-full max-w-4xl px-6 pt-[20px] flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-red rounded-full"></div>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="bg-bg text-cream min-h-screen flex flex-col items-center relative">
        <Cursor />
        <div className="w-full max-w-4xl px-6 pt-[20px] flex flex-col justify-center items-center text-center min-h-[60vh]">
          <h1 className="font-display text-4xl mb-4 text-white">Order Not Found</h1>
          <p className="font-body text-white/50 mb-8">{error || "We couldn't locate this order."}</p>
          <a href="/" className="font-body text-xs tracking-widest uppercase bg-[var(--red)] text-white px-8 py-3 rounded hover:opacity-80 transition">
            Return Home
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-bg text-cream min-h-screen flex flex-col items-center relative">
      <Cursor />
      <div className="w-full max-w-4xl px-6 md:px-16 pt-[20px] pb-24">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4 tracking-widest uppercase">Order Receipt</h1>
          <p className="font-body text-white/50 tracking-widest text-xs uppercase">#{order.id}</p>
        </div>

        {/* Order Status & Delivery Estimate Banner */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 mb-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl text-white tracking-widest uppercase mb-2">Order Status</h3>
            <span className={`inline-block px-4 py-1.5 text-xs font-semibold rounded-full uppercase tracking-widest ${
              order.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
              'bg-white/10 text-white/60 border border-white/20'
            }`}>
              {order.status === 'paid' ? 'Confirmed & Processing' : order.status}
            </span>
          </div>
          <div className="md:text-right">
            <h3 className="font-display text-xl text-white tracking-widest uppercase mb-2">Estimated Delivery</h3>
            <p className="font-body text-white/80">6 to 7 Business Days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Shipping Details */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-lg text-white tracking-widest uppercase mb-6 border-b border-white/10 pb-3">Shipping Details</h3>
            <div className="space-y-4 font-body">
              <div>
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Customer</p>
                <p className="text-white/80">{order.customers?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Contact</p>
                <p className="text-white/80">{order.customers?.email || 'N/A'}</p>
                <p className="text-white/80">{order.customers?.mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Address</p>
                <p className="text-white/80 leading-relaxed">
                  {order.shipping_address || 'Address not provided'}<br />
                  {order.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-lg text-white tracking-widest uppercase mb-6 border-b border-white/10 pb-3">Payment Details</h3>
            <div className="space-y-4 font-body">
              <div>
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Date</p>
                <p className="text-white/80">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Payment Method</p>
                <p className="text-white/80">Razorpay Online</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Transaction ID</p>
                <p className="text-white/80 font-mono text-sm">{order.razorpay_payment_id || 'N/A'}</p>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-[var(--red)] tracking-widest uppercase mb-1 font-bold">Total Paid</p>
                <p className="font-display text-3xl text-white">₹{order.amount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div>
          <h3 className="font-display text-2xl text-white tracking-widest uppercase mb-6">Items Purchased</h3>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.05] border-b border-white/10">
                    <th className="font-body text-[10px] text-white/50 uppercase tracking-widest p-4">Item</th>
                    <th className="font-body text-[10px] text-white/50 uppercase tracking-widest p-4 text-center">Qty</th>
                    <th className="font-body text-[10px] text-white/50 uppercase tracking-widest p-4 text-right">Price</th>
                    <th className="font-body text-[10px] text-white/50 uppercase tracking-widest p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm text-white/80">
                  {order.order_items.map((item, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="p-4">{item.product_name}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">₹{item.price}</td>
                      <td className="p-4 text-right text-white font-medium">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white/[0.05] p-6 flex justify-between items-center border-t border-white/10">
              <span className="font-body text-sm tracking-widest uppercase text-white/50">Grand Total</span>
              <span className="font-display text-2xl text-[var(--red)]">₹{order.amount}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
