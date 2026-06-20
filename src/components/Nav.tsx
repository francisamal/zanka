'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-5 md:px-10 py-4 flex items-center justify-between transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(229,33,43,0.2)' : '1px solid transparent',
        }}
      >
        <a href="#" className="relative shrink-0" style={{ width: 110, height: 56 }}>
          <Image src="/logo/1000340389.png" alt="ZANKA" fill className="object-contain object-left" />
        </a>

        <ul className="hidden md:flex gap-10">
          {['Socks', 'Tops', 'About', 'Contact'].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="font-body text-xs tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300" style={{ background: 'var(--red)' }} />
              </a>
            </li>
          ))}
        </ul>

        <a
          href="https://www.instagram.com/wardrobeofzanka"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block font-body text-xs tracking-[0.2em] uppercase text-white/30 hover:text-red transition-colors duration-300"
          style={{ '--tw-text-opacity': '1' } as React.CSSProperties}
        >
          @wardrobeofzanka
        </a>

        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ background: 'rgba(8,8,8,0.97)' }}>
        <ul className="flex flex-col gap-8 text-center">
          {['Socks', 'Tops', 'About', 'Contact'].map(item => (
            <li key={item}>
              <a href={`#${item.toLowerCase()}`} className="font-display text-5xl text-white hover:text-red transition-colors duration-300" style={{ color: undefined }} onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
