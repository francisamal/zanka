'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Script from 'next/script'
import { useCart, CartItem } from '@/utils/CartContext'

export default function CartDrawer() {
  const {
    cartItems,
    customer,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    signInCustomer,
    signOutCustomer,
    clearCart,
  } = useCart()

  // Sign-in form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [signInError, setSignInError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  // Payment/checkout state
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [placedOrder, setPlacedOrder] = useState<any | null>(null)

  if (!cartOpen) return null

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.priceNumber * item.quantity, 0)
  }

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

  const handleCheckout = async () => {
    if (!customer) return
    setCheckingOut(true)
    setCheckoutError('')

    try {
      // 1. Create Order on Backend
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          shippingAddress: customer.address || '',
          pincode: customer.pincode || '',
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
          }))
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order.')
      }

      const orderData = await response.json()
      const { orderId, razorpayOrderId, amount, currency } = orderData

      // 2. Open Razorpay Checkout Dialog
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_T5Qhc14XEsR02M'
      
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'ZANKA',
        description: 'Order Placement',
        order_id: razorpayOrderId,
        prefill: {
          name: customer.name,
          email: customer.email || '',
          contact: customer.mobile || '',
        },
        theme: {
          color: '#e5212b',
        },
        handler: async function (paymentResponse: any) {
          try {
            setCheckingOut(true)
            // 3. Verify Payment on Backend
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              })
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              setPlacedOrder({
                orderId,
                paymentId: paymentResponse.razorpay_payment_id,
                amount: amount / 100,
                customer: customer
              })
              clearCart()
            } else {
              setCheckoutError(verifyData.error || 'Payment verification failed.')
            }
          } catch (err: any) {
            setCheckoutError('Error verifying payment: ' + err.message)
          } finally {
            setCheckingOut(false)
          }
        },
        modal: {
          ondismiss: function () {
            setCheckingOut(false)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.')
      setCheckingOut(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Cart Overlay Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity duration-500"
        onClick={() => setCartOpen(false)}
      />

      {/* Slide-out Drawer Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] flex flex-col transition-transform duration-500 overflow-hidden border-l border-white/5"
        style={{
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Header */}
        <div className="p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-2xl tracking-[0.15em] text-white">YOUR CART</h2>
            {cartItems.length > 0 && (
              <span className="font-body text-xs bg-[var(--red)] text-white px-2.5 py-1 rounded-full font-bold shadow-[0_0_10px_rgba(229,33,43,0.4)]">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            )}
          </div>
          <button
            className="text-white/40 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full hover:rotate-90"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {placedOrder ? (
            /* Order Success State */
            <div className="text-center py-8 space-y-6 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-red/10 border border-red/40 rounded-full flex items-center justify-center text-red text-3xl animate-pulse">
                ✓
              </div>
              <h3 className="font-display text-3xl tracking-widest text-white">ORDER PLACED!</h3>
              <p className="font-body text-sm text-white/70 max-w-xs leading-relaxed">
                Thank you, <strong>{placedOrder.customer.name}</strong>. Your payment was verified and order has been processed.
              </p>
              
              <div className="w-full bg-white/5 border border-white/10 rounded p-4 text-left space-y-2.5 font-body text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Order Reference:</span>
                  <span className="text-white font-mono">{placedOrder.orderId.substring(0, 18)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Payment ID:</span>
                  <span className="text-white font-mono">{placedOrder.paymentId}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="text-white/50">Total Paid:</span>
                  <span className="text-red font-semibold text-sm">₹{placedOrder.amount}</span>
                </div>
              </div>

              <button
                className="w-full font-body text-xs tracking-[0.2em] uppercase py-3 font-semibold transition-all duration-300 hover:opacity-90"
                style={{ background: 'var(--red)', color: '#fff' }}
                onClick={() => {
                  setPlacedOrder(null)
                  setCartOpen(false)
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 space-y-6 flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 rounded-full border border-dashed border-white/10 flex items-center justify-center bg-white/[0.02]">
                <span className="text-4xl opacity-50">🛍️</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl tracking-wider text-white">CART IS EMPTY</h3>
                <p className="font-body text-white/40 text-sm font-light">Looks like you haven't added anything yet.</p>
              </div>
              <button
                className="relative inline-flex items-center justify-center gap-2 bg-[var(--red)] text-white font-display text-base tracking-[0.15em] uppercase px-10 py-4 rounded-md overflow-hidden group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(229,33,43,0.5)] hover:-translate-y-1 mt-4"
                onClick={() => setCartOpen(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  START SHOPPING
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </div>
          ) : (
            /* Items List */
            <div className="space-y-6 px-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-5 p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all rounded-2xl group shadow-lg"
                >
                  <div className="relative w-20 h-24 bg-neutral-900 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-body text-base font-medium text-white truncate pr-2">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/30 hover:text-red transition-colors mt-0.5"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <span className="inline-block mt-1.5 font-body text-[10px] tracking-widest text-red uppercase px-2 py-0.5 bg-red/10 rounded-full font-semibold border border-red/20">
                        {item.tag}
                      </span>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-full overflow-hidden p-0.5">
                        <button
                          className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-body text-sm font-medium text-white">
                          {item.quantity}
                        </span>
                        <button
                          className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="font-body text-lg font-medium text-white tracking-wide">
                        ₹{item.priceNumber * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Panel - Sign In or Checkout */}
        {!placedOrder && cartItems.length > 0 && (
          <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 backdrop-blur-xl space-y-6">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body text-sm tracking-widest text-white/50 uppercase">Subtotal</span>
              <span className="font-display text-2xl tracking-wide text-white">₹{calculateSubtotal()}</span>
            </div>

            {/* Check Customer Authenticated State */}
            {!customer ? (
              /* Simple Sign-in / Registration Form */
              <form onSubmit={handleSignIn} className="space-y-4 pt-4 border-t border-white/5">
                <p className="font-body text-[10px] tracking-[0.15em] text-white/40 uppercase">
                  Sign in to checkout
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-red focus:bg-white/[0.05] focus:outline-none transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-red focus:bg-white/[0.05] focus:outline-none transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-red focus:bg-white/[0.05] focus:outline-none transition-all"
                  />
                  <textarea
                    placeholder="Shipping Address (Street, City, State)"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-red focus:bg-white/[0.05] focus:outline-none transition-all resize-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode / Zip Code"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-red focus:bg-white/[0.05] focus:outline-none transition-all"
                  />
                </div>

                {signInError && (
                  <p className="text-red font-body text-xs mt-2 px-1">{signInError}</p>
                )}

                <button
                  type="submit"
                  disabled={signingIn}
                  className="relative w-full overflow-hidden mt-4 bg-[var(--red)] text-white font-display text-base tracking-[0.15em] uppercase py-4 rounded-md group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(229,33,43,0.5)] disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <span className="relative z-10">
                    {signingIn ? 'SAVING DETAILS...' : 'SIGN IN & CHECKOUT'}
                  </span>
                  {!signingIn && <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />}
                </button>
              </form>
            ) : (
              /* Verified Checkout Section */
              <div className="space-y-5 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between bg-white/[0.03] rounded-xl p-4 border border-white/10">
                  <div className="font-body space-y-1">
                    <p className="text-white/40 uppercase text-[10px] tracking-widest font-semibold mb-2">Customer</p>
                    <p className="text-white text-sm font-medium">{customer.name}</p>
                    <p className="text-white/50 text-xs mb-2">{customer.email || 'No Email'} {customer.mobile ? `· ${customer.mobile}` : ''}</p>
                    {customer.address && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-white/40 uppercase text-[9px] tracking-widest font-semibold mb-1">Shipping To</p>
                        <p className="text-white/80 text-xs leading-relaxed">{customer.address}<br/>{customer.pincode}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={signOutCustomer}
                    className="text-[10px] tracking-widest font-bold text-white/40 uppercase hover:text-white transition-colors py-2 px-3 bg-white/5 rounded-lg hover:bg-white/10"
                  >
                    Edit
                  </button>
                </div>

                {checkoutError && (
                  <p className="text-red font-body text-xs px-1">{checkoutError}</p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="relative w-full overflow-hidden bg-[var(--red)] text-white font-display text-base tracking-[0.15em] uppercase py-4 rounded-md group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(229,33,43,0.5)] disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-3"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {checkingOut ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        PROCESSING PAYMENT...
                      </>
                    ) : (
                      'PLACE ORDER & PAY'
                    )}
                  </span>
                  {!checkingOut && <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
