'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = footerRef.current
      if (!container) return

      const reveals = container.querySelectorAll('.footer-reveal')
      if (reveals.length > 0) {
        gsap.fromTo(reveals,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
            },
          }
        )
      }
    }, footerRef)
    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden border-t"
      style={{
        borderColor: 'rgba(229, 33, 43, 0.12)',
        background: 'linear-gradient(to bottom, #080808 0%, #050505 100%)',
        paddingTop: '6rem',
        paddingBottom: '3rem',
        paddingLeft: 'clamp(1.5rem, 3vw, 6rem)',
        paddingRight: 'clamp(1.5rem, 3vw, 6rem)',
      }}
    >
      {/* Light Red Glow Accent */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[350px] pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(229, 33, 43, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          transform: 'translate(-50%, 50%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Upper Part: JOIN THE MOVEMENT CTA */}
        <div className="text-center mb-20">
          <div className="footer-reveal">
            <p
              className="font-body text-xs tracking-[0.4em] uppercase font-semibold mb-4"
              style={{ color: 'var(--red)' }}
            >
              Get In Touch
            </p>
          </div>
          <div className="footer-reveal">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] text-white leading-none tracking-widest mb-6">
              JOIN THE MOVEMENT
            </h2>
          </div>
          <div className="footer-reveal h-[2px] w-16 mx-auto mb-6" style={{ background: 'var(--red)' }} />

          <div className="footer-reveal flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://www.instagram.com/wardrobeofzanka"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs tracking-[0.3em] uppercase px-8 py-3.5 font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--red)',
                color: '#fff',
                borderRadius: '2px',
                boxShadow: '0 4px 15px rgba(229, 33, 43, 0.2)',
              }}
            >
              Instagram
            </a>
            <a
              href="mailto:hello@zanka.in"
              className="font-body text-xs tracking-[0.3em] uppercase px-8 py-3.5 border font-medium transition-all duration-300 hover:bg-white/5 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '2px',
              }}
            >
              Email Us
            </a>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t mb-12" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

        {/* Lower Part: Directory Columns */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 mb-12">
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span
              className="mb-4 select-none leading-none inline-block text-white"
              style={{
                fontFamily: 'var(--font-brand), cursive',
                fontSize: '2rem',
                letterSpacing: '0.04em',
                WebkitTextStroke: '0.5px rgba(229,33,43,0.6)',
                textShadow: '0 0 20px rgba(229,33,43,0.3)',
              }}
            >
              ZANKA
            </span>
            <p className="font-body text-xs text-white/40 tracking-wider max-w-xs font-light leading-relaxed">
              Pop culture socks and statement fashion designs. Unapologetic styling, premium fabrics.
            </p>
          </div>

          {/* Connect Info */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/30 font-semibold mb-5">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/wardrobeofzanka"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-300 font-medium"
              >
                @wardrobeofzanka
              </a>
              <a
                href="mailto:hello@zanka.in"
                className="font-body text-xs tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-300 font-medium"
              >
                hello@zanka.in
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}
        >
          <p className="font-body text-[10px] text-white/20 tracking-widest font-light uppercase">
            © {new Date().getFullYear()} ZANKA. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="font-body text-[10px] text-white/20 tracking-[0.3em] uppercase font-light">
              Beyond The Usual.
            </p>
            <span className="font-body text-[10px] tracking-widest" style={{ color: 'rgba(229, 33, 43, 0.5)' }}>
              {process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0.0-dev'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
