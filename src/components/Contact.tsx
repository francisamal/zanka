'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current?.querySelectorAll('.reveal'),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="contact" className="py-28 px-5 md:px-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(229,33,43,0.07) 0%, transparent 65%)' }} />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="reveal">
          <p className="font-body text-xs tracking-[0.4em] uppercase font-light mb-5" style={{ color: 'var(--red)' }}>Get In Touch</p>
        </div>
        <div className="reveal">
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] text-white leading-none tracking-widest mb-8">
            JOIN THE<br />MOVEMENT
          </h2>
        </div>
        <div className="reveal h-px w-12 mx-auto mb-8" style={{ background: 'var(--red)' }} />
        <div className="reveal">
          <p className="font-body text-white/40 font-light leading-relaxed mb-10">
            DM us on Instagram, drop an email, or just follow along to catch the latest drops. We&apos;re always dropping new designs.
          </p>
        </div>
        <div className="reveal flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://www.instagram.com/wardrobeofzanka"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs tracking-[0.3em] uppercase px-10 py-4 font-medium transition-all duration-300 hover:opacity-80"
            style={{ background: 'var(--red)', color: '#fff' }}
          >
            Instagram
          </a>
          <a
            href="mailto:hello@zanka.in"
            className="font-body text-xs tracking-[0.3em] uppercase px-10 py-4 border text-white/50 hover:text-white hover:border-white/50 transition-all duration-300"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            Email Us
          </a>
        </div>
      </div>
    </section>
  )
}
