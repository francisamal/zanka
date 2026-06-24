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
      const res = await signInCustomer(name, email, mobile)
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
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setCartOpen(false)}
      />

      {/* Slide-out Drawer Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] bg-[#0c0c0c] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 overflow-hidden"
        style={{
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🧦</span>
            <h2 className="font-display text-2xl tracking-wider text-white">YOUR CART</h2>
            {cartItems.length > 0 && (
              <span className="font-body text-xs bg-red text-white px-2 py-0.5 rounded-full font-bold">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <button
            className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            <div className="text-center py-16 space-y-4 flex flex-col items-center justify-center h-full">
              <span className="text-5xl opacity-40">🛍️</span>
              <p className="font-body text-white/50 text-sm tracking-wider uppercase">Your cart is empty</p>
              <button
                className="font-body text-xs text-white/90 hover:text-white border border-white/20 hover:border-white px-6 py-2.5 rounded-full transition-all duration-300"
                onClick={() => setCartOpen(false)}
              >
                Browse Products
              </button>
            </div>
          ) : (
            /* Items List */
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white/5 border border-white/5 hover:border-white/10 transition-all rounded"
                >
                  <div className="relative w-16 h-20 bg-neutral-900 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-body text-sm font-medium text-white truncate">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/40 hover:text-red transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <span className="font-body text-[9px] tracking-widest text-red uppercase font-semibold">
                        {item.tag}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-white/10 rounded overflow-hidden">
                        <button
                          className="px-2.5 py-1 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-semibold"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-body text-xs font-medium text-white bg-white/5">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2.5 py-1 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-semibold"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="font-body text-sm font-semibold text-white">
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
          <div className="p-6 border-t border-white/10 bg-[#070707] space-y-4">
            <div className="flex justify-between items-end">
              <span className="font-body text-xs tracking-wider text-white/60 uppercase">Subtotal</span>
              <span className="font-body text-xl font-bold text-red">₹{calculateSubtotal()}</span>
            </div>

            {/* Check Customer Authenticated State */}
            {!customer ? (
              /* Simple Sign-in / Registration Form */
              <form onSubmit={handleSignIn} className="space-y-3 pt-3 border-t border-white/5">
                <p className="font-body text-[11px] tracking-wider text-white/50 leading-relaxed uppercase">
                  Please sign in to proceed to checkout
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:border-red focus:outline-none transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:border-red focus:outline-none transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:border-red focus:outline-none transition-colors"
                  />
                </div>

                {signInError && (
                  <p className="text-red font-body text-xs leading-snug">{signInError}</p>
                )}

                <button
                  type="submit"
                  disabled={signingIn}
                  className="w-full font-body text-xs tracking-[0.2em] uppercase py-3 font-semibold transition-all duration-300 disabled:opacity-50"
                  style={{ background: 'var(--red)', color: '#fff' }}
                >
                  {signingIn ? 'Saving Details...' : 'Sign In & Checkout'}
                </button>
              </form>
            ) : (
              /* Verified Checkout Section */
              <div className="space-y-4 pt-3 border-t border-white/5">
                <div className="flex items-start justify-between bg-white/5 rounded p-3 border border-white/5">
                  <div className="font-body text-xs space-y-1">
                    <p className="text-white/40 uppercase text-[10px] tracking-wider font-semibold">Logged In Customer</p>
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-white/60">{customer.email || 'No Email'} {customer.mobile ? `· ${customer.mobile}` : ''}</p>
                  </div>
                  <button
                    onClick={signOutCustomer}
                    className="text-[10px] tracking-wider font-bold text-red uppercase hover:opacity-80 transition-opacity"
                  >
                    Change
                  </button>
                </div>

                {checkoutError && (
                  <p className="text-red font-body text-xs leading-snug">{checkoutError}</p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full font-body text-xs tracking-[0.2em] uppercase py-3.5 font-semibold transition-all duration-300 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'var(--red)', color: '#fff' }}
                >
                  {checkingOut ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing Payment...
                    </>
                  ) : (
                    'Place Order & Pay'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
