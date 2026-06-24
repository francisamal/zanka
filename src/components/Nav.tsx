'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/utils/CartContext'
import CartDrawer from '@/components/CartDrawer'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartItems, setCartOpen, customer, signOutCustomer } = useCart()
  const [mounted, setMounted] = useState(false)

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-500">
        <nav
          className="flex items-center justify-between py-3 px-6 md:px-8 transition-all duration-500 rounded-full"
          style={{
            background: scrolled ? 'rgba(8, 8, 8, 0.85)' : 'rgba(8, 8, 8, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: scrolled ? '1px solid rgba(229, 33, 43, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.5), 0 1px 15px rgba(229, 33, 43, 0.05)' : 'none',
          }}
        >
          {/* Placeholder to keep center navigation aligned */}
          <div className="w-[80px] hidden md:block" />

          {/* Centered navigation links */}
          <ul className="hidden md:flex items-center gap-8">
            {[{ label: 'Shop', href: '#socks' }, { label: 'Feeds', href: '#feeds' }, { label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="font-body text-xs tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors duration-300 relative group font-medium"
                >
                  {item.label}
                  <span
                    className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
                    style={{ background: 'var(--red)' }}
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-3">
            {/* Customer Sign-In status */}
            {mounted && customer && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-full pl-3 pr-2 py-1.5 font-body text-[10px] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] flex-shrink-0"></span>
                <span className="tracking-widest uppercase font-medium max-w-[60px] md:max-w-[100px] truncate">
                  {customer.name.split(' ')[0]}
                </span>
                <button
                  onClick={signOutCustomer}
                  className="text-white/40 hover:text-red transition-colors ml-0.5 p-0.5"
                  title="Sign Out"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 hover:bg-white/5 rounded-full transition-colors flex items-center justify-center text-white/80 hover:text-white border border-white/10 hover:border-white/20"
              aria-label="View Cart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red text-[8px] font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Instagram Connect button (desktop only) */}
            <div className="hidden md:block">
              <a
                href="https://www.instagram.com/wardrobeofzanka"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-[10px] tracking-[0.2em] uppercase text-white/70 hover:text-white border px-4 py-2 rounded-full transition-all duration-300 hover:bg-white/5"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                @wardrobeofzanka
              </a>
            </div>

            {/* Mobile hamburger menu button */}
            <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(!menuOpen)}>
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden transition-all duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(8,8,8,0.98)' }}
      >
        <ul className="flex flex-col gap-8 text-center">
          {[{ label: 'Shop', href: '#socks' }, { label: 'Feeds', href: '#feeds' }, { label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }].map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="font-display text-4xl tracking-widest text-white hover:text-red transition-colors duration-300"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Cart Side Drawer Panel */}
      <CartDrawer />
    </>
  )
}
