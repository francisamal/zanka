'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const allProducts = [
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.02 PM.jpeg', span: 'row-span-2' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.02 PM (1).jpeg', span: '' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.03 PM (1).jpeg', span: '' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.04 PM.jpeg', span: 'row-span-2' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.03 PM (2).jpeg', span: '' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.05 PM.jpeg', span: '' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.05 PM (1).jpeg', span: '' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.06 PM.jpeg', span: '' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.07 PM (1).jpeg', span: 'row-span-2' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.07 PM (2).jpeg', span: '' },
  { src: '/products/WhatsApp Image 2026-06-20 at 12.24.08 PM (1).jpeg', span: '' },
]

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        gsap.fromTo(gridRef.current.querySelectorAll('.gallery-item'),
          { opacity: 0, scale: 0.96 },
          {
            opacity: 1, scale: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 72%' },
          }
        )
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-5 md:px-10">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="font-body text-xs tracking-[0.4em] uppercase font-light mb-3" style={{ color: 'var(--red)' }}>Drop</p>
          <h2 className="font-display text-[clamp(2rem,6vw,5rem)] text-white leading-none tracking-widest">THE FEED</h2>
        </div>
        <a
          href="https://www.instagram.com/wardrobeofzanka"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase text-white/30 hover:text-white transition-colors duration-300"
        >
          <span>@wardrobeofzanka</span>
          <span className="w-8 h-px" style={{ background: 'var(--red)' }} />
        </a>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-2 md:gap-3"
      >
        {allProducts.map((item, i) => (
          <div key={i} className={`gallery-item relative overflow-hidden group ${item.span}`} style={{ opacity: 0 }}>
            <Image
              src={item.src}
              alt={`ZANKA product ${i + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 transition-all duration-400 group-hover:bg-red/10" style={{ '--tw-bg-opacity': '0.1' } as React.CSSProperties} />
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'var(--red)' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
