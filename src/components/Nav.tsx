'use client'

import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
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
          {/* Stylized text brand name on the left */}
          <a
            href="#"
            className="select-none leading-none inline-block text-white transition-opacity duration-300 hover:opacity-80"
            style={{
              fontFamily: 'var(--font-brand), cursive',
              fontSize: '1.4rem',
              letterSpacing: '0.04em',
              WebkitTextStroke: '0.3px rgba(229,33,43,0.5)',
              textShadow: '0 0 10px rgba(229,33,43,0.2)',
            }}
          >
          </a>

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

          {/* Instagram Connect button on the right */}
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
    </>
  )
}
