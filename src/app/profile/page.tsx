'use client'

import React, { useEffect, useState } from 'react'
import { useCart } from '@/utils/CartContext'
import Nav from '@/components/Nav'
import Cursor from '@/components/Cursor'

interface Order {
  id: string
  status: string
  amount: number
  created_at: string
  shipping_address: string
  pincode: string
  order_items: {
    product_name: string
    quantity: number
    price: number
  }[]
}

export default function ProfilePage() {
  const { customer, isLoaded, signInCustomer } = useCart()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Form states for login if not authenticated
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [signInError, setSignInError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (customer?.id) {
      fetch(`/api/customer/orders?customerId=${customer.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [customer])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError('')

    if (!name.trim()) {
      setSignInError('Name is required.')
      return
    }
    if (!email.trim() && !mobile.trim()) {
      setSignInError('Please provide either an Email or a Mobile number.')
      return
    }

    setSigningIn(true)
    try {
      const res = await signInCustomer(name, email, mobile, address, pincode)
      if (!res) {
        setSignInError('Failed to sign in. Please try again.')
      }
    } catch (err: any) {
      setSignInError(err.message || 'An error occurred during sign in.')
    } finally {
      setSigningIn(false)
    }
  }

  // 1. Loading screen while restoring localStorage customer session
  if (!isLoaded) {
    return (
      <main className="bg-bg text-cream min-h-screen relative flex items-center justify-center">
        <Cursor />
        <Nav />
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-red rounded-full"></div>
      </main>
    )
  }

  // 2. Unauthenticated state - Show a stunning Sign-in Form
  if (!customer) {
    return (
      <main className="profile-page-main bg-bg text-cream min-h-screen flex flex-col items-center pb-24 relative">
        <Cursor />
        <Nav />
        <div className="my-auto w-full px-6 max-w-md mx-auto flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-white tracking-widest uppercase mb-3">Your Profile</h1>
            <p className="font-body text-white/50 text-xs tracking-wider uppercase max-w-xs leading-relaxed">
              Sign in to view your orders, track shipments, and manage your delivery details.
            </p>
          </div>

          {/* Premium Form Card */}
          <div className="w-full bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-white/15">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-3 font-body">
                <div>
                  <label className="block text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm text-white placeholder-white/25 focus:border-[var(--red)] focus:bg-white/[0.05] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm text-white placeholder-white/25 focus:border-[var(--red)] focus:bg-white/[0.05] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm text-white placeholder-white/25 focus:border-[var(--red)] focus:bg-white/[0.05] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Shipping Address</label>
                  <textarea
                    placeholder="Street name, Appt, Area, City, State"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm text-white placeholder-white/25 focus:border-[var(--red)] focus:bg-white/[0.05] focus:outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Pincode / Zip Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 110001"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm text-white placeholder-white/25 focus:border-[var(--red)] focus:bg-white/[0.05] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {signInError && (
                <p className="text-[var(--red)] font-body text-xs mt-2 px-1">{signInError}</p>
              )}

              <button
                type="submit"
                disabled={signingIn}
                className="relative w-full overflow-hidden mt-6 bg-[var(--red)] text-white font-display text-sm tracking-[0.2em] uppercase py-3.5 rounded-xl group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(229,33,43,0.35)] disabled:opacity-50 disabled:hover:shadow-none cursor-pointer"
              >
                <span className="relative z-10 font-bold">
                  {signingIn ? 'VERIFYING...' : 'ACCESS PROFILE'}
                </span>
                {!signingIn && <div className="absolute inset-0 bg-white/15 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />}
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  // 3. Authenticated state - Show details and order history
  return (
    <main className="profile-page-main bg-bg text-cream min-h-screen flex flex-col items-center pb-24 relative">
      <Cursor />
      <Nav />
      <div className="my-auto w-full px-6 max-w-3xl mx-auto flex flex-col">
        
        {/* Page Header (Tucked neatly right under the top bar) */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl text-white tracking-widest uppercase mb-4">Your Profile</h1>
          <div className="h-px w-24 bg-[var(--red)] mx-auto opacity-50"></div>
        </div>

        {/* Section Content Wrapper */}
        <div className="flex flex-col gap-12 w-full font-body">
          
          {/* Personal Details */}
          <div className="w-full bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.03] hover:border-white/15">
            <h2 className="font-display text-xl text-white/80 tracking-widest uppercase mb-8 text-center border-b border-white/5 pb-4">Personal Details</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
              <div className="flex flex-col items-center">
                <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Name</p>
                <p className="text-white font-medium text-lg">{customer.name}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Contact</p>
                <p className="text-white/80 text-sm font-medium">{customer.email || 'No Email'}</p>
                <p className="text-white/80 text-sm font-medium">{customer.mobile || 'No Mobile'}</p>
              </div>

              {(customer.address || customer.pincode) && (
                <div className="flex flex-col items-center">
                  <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Shipping Address</p>
                  <p className="text-white/80 text-sm text-center max-w-[200px] leading-relaxed font-medium">
                    {customer.address}<br />{customer.pincode}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="w-full flex flex-col items-center">
            <h2 className="font-display text-3xl text-white tracking-widest uppercase mb-8 text-center">Order History</h2>
            
            {loading ? (
              <div className="animate-pulse space-y-6 w-full">
                <div className="h-32 bg-white/5 rounded-2xl w-full border border-white/10"></div>
                <div className="h-32 bg-white/5 rounded-2xl w-full border border-white/10"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="w-full bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-16 text-center">
                <svg className="w-12 h-12 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <p className="font-body text-white/50 tracking-widest uppercase text-xs">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-6 w-full">
                {orders.map(order => (
                  <a 
                    href={`/order/${order.id}`} 
                    key={order.id} 
                    className="block group bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6 mb-6">
                      <div className="text-center md:text-left">
                        <p className="font-body text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Order Date</p>
                        <p className="font-body text-white/90 text-sm">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      
                      <div className="text-center">
                        <span className={`inline-block px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest transition-colors ${
                          order.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20 group-hover:bg-green-500/20 group-hover:border-green-500/40' :
                          order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/40' :
                          'bg-white/10 text-white/60 border border-white/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="text-center md:text-right">
                        <p className="font-body text-[10px] text-white/40 tracking-widest uppercase mb-1 font-semibold">Total Amount</p>
                        <p className="font-display text-2xl text-[var(--red)] group-hover:text-red-400 transition-colors">₹{order.amount}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex-1 space-y-2 w-full text-center md:text-left">
                        {order.order_items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center font-body text-sm max-w-sm mx-auto md:mx-0">
                            <p className="text-white/70">{item.quantity}x {item.product_name}</p>
                            <p className="text-white/40">₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex-shrink-0 mt-4 md:mt-0">
                        <span className="font-body text-[10px] tracking-widest uppercase text-white/50 group-hover:text-white transition-colors flex items-center gap-2 border border-white/10 group-hover:border-white/30 rounded-full px-5 py-2.5 bg-white/5 group-hover:bg-white/10">
                          View Receipt <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </main>
  )
}
