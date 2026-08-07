'use client'

import React, { useState } from 'react'

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
}

export interface Customer {
  id: string
  name: string
  email: string | null
  mobile: string | null
}

export interface Order {
  id: string
  customer_id: string
  amount: number
  status: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  created_at: string
  customer: Customer | null
  items: OrderItem[]
}

interface OrdersTabProps {
  orders: Order[]
  ordersLoading: boolean
  handleUpdateOrderStatus: (orderId: string, status: string) => void
  handleDeleteOrder: (orderId: string) => void
}

export function OrdersTab({
  orders,
  ordersLoading,
  handleUpdateOrderStatus,
  handleDeleteOrder
}: OrdersTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase()
    const customerName = o.customer?.name || ''
    const customerEmail = o.customer?.email || ''
    const customerMobile = o.customer?.mobile || ''
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerMobile.includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  const totalOrders = orders.length
  const paidOrders = orders.filter((o) => o.status.toLowerCase() === 'paid').length
  const totalRevenue = orders
    .filter((o) => o.status.toLowerCase() === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0)

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'paid') {
      return (
        <span className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-body text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
          ● Paid
        </span>
      )
    }
    if (s === 'pending') {
      return (
        <span className="bg-amber-950/40 border border-amber-500/30 text-amber-400 font-body text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
          ● Pending
        </span>
      )
    }
    return (
      <span className="bg-red-950/40 border border-red-500/30 text-red-400 font-body text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
        ● {status}
      </span>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="font-body text-[10px] uppercase tracking-widest text-white/50 font-semibold">Total Orders</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-display text-2xl md:text-3xl font-bold text-white">{totalOrders}</span>
            <span className="text-red-500 font-mono text-xs font-semibold">📦 Placed</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="font-body text-[10px] uppercase tracking-widest text-white/50 font-semibold">Successful Orders</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-display text-2xl md:text-3xl font-bold text-emerald-400">{paidOrders}</span>
            <span className="text-emerald-500/80 font-mono text-xs font-semibold">Paid Status</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="font-body text-[10px] uppercase tracking-widest text-white/50 font-semibold">Total Revenue (Paid)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-display text-2xl md:text-3xl font-bold text-white">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-emerald-400 font-mono text-xs font-semibold">₹ INR</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-sm">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-widest text-white uppercase">
            Customer Orders
          </h2>
          <p className="font-body text-xs text-white/50 tracking-wider mt-0.5">
            Review customer transactions, update order status, and inspect payment details
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search customer or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-500 transition-colors font-body"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex gap-1.5 bg-[#181818] border border-white/10 rounded-xl p-1 shrink-0">
            {['all', 'paid', 'pending', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-body text-xs uppercase tracking-wider transition-all ${
                  statusFilter === st
                    ? 'bg-red-600 text-white font-bold shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      {ordersLoading ? (
        <div className="text-center py-20 text-white/40 font-body text-xs uppercase tracking-widest">
          Loading Customer Orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-24 border border-white/10 rounded-2xl bg-[#121212] px-4">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-white/40 text-lg">
            📦
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-2">
            No Orders Found
          </h3>
          <p className="font-body text-xs text-white/40 max-w-sm mx-auto">
            No transactions match the selected filter or search term.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id

            return (
              <div
                key={order.id}
                className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Main Row */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-white">
                          #{order.id.slice(0, 8)}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="font-body text-xs text-white/40 font-mono">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="sm:border-l sm:border-white/10 sm:pl-4">
                      <p className="font-body text-sm font-bold text-white">
                        {order.customer?.name || 'Guest Customer'}
                      </p>
                      <p className="font-body text-xs text-white/50">
                        {order.customer?.email || order.customer?.mobile || 'No contact specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
                    <div className="text-left md:text-right">
                      <span className="font-body text-[10px] text-white/40 uppercase block">Total Amount</span>
                      <span className="font-display text-base md:text-lg font-bold text-white">
                        ₹{order.amount ? order.amount.toLocaleString('en-IN') : '0'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status selector */}
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="bg-[#181818] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-body focus:outline-none focus:border-red-500 transition-colors"
                      >
                        <option value="paid">paid</option>
                        <option value="pending">pending</option>
                        <option value="failed">failed</option>
                        <option value="refunded">refunded</option>
                      </select>

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-white font-body text-xs font-semibold tracking-wider uppercase transition-all"
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white font-body text-xs font-semibold uppercase transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Card */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-[#0d0d0d] p-6 space-y-6 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Razorpay & Payment Metadata */}
                      <div className="bg-[#151515] border border-white/10 rounded-xl p-4 space-y-2 font-mono text-xs">
                        <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-2 text-white/80">
                          Razorpay Payment Details
                        </h4>
                        <div className="flex justify-between text-white/60">
                          <span>Razorpay Order ID:</span>
                          <span className="text-white">{order.razorpay_order_id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Payment ID:</span>
                          <span className="text-white">{order.razorpay_payment_id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Signature Verified:</span>
                          <span className={order.razorpay_signature ? 'text-emerald-400' : 'text-red-400'}>
                            {order.razorpay_signature ? 'Verified ✓' : 'Not Verified'}
                          </span>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="bg-[#151515] border border-white/10 rounded-xl p-4 space-y-2 text-xs font-body">
                        <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-2 text-white/80">
                          Customer Information
                        </h4>
                        <div className="flex justify-between text-white/60">
                          <span>Customer Name:</span>
                          <span className="text-white font-semibold">{order.customer?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Email:</span>
                          <span className="text-white font-mono">{order.customer?.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Mobile:</span>
                          <span className="text-white font-mono">{order.customer?.mobile || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Line Items */}
                    <div>
                      <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-3">
                        Purchased Items ({order.items?.length || 0})
                      </h4>
                      {!order.items || order.items.length === 0 ? (
                        <p className="font-body text-xs text-white/40">No item breakdown available for this order.</p>
                      ) : (
                        <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                          {order.items.map((item) => (
                            <div key={item.id} className="p-3 bg-[#151515] flex items-center justify-between text-xs">
                              <div>
                                <p className="font-body font-bold text-white">{item.product_name}</p>
                                <p className="font-mono text-[10px] text-white/40">Product ID: {item.product_id}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-body text-white/60 mr-4">Qty: {item.quantity}</span>
                                <span className="font-display font-bold text-white">
                                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
