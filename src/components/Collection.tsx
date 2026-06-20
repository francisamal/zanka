'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const pieces = [
  {
    id: 1,
    title: 'Ivory Dream',
    category: 'Evening Wear',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    price: '₹12,500',
  },
  {
    id: 2,
    title: 'Noir Essence',
    category: 'Cocktail',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    price: '₹9,800',
  },
  {
    id: 3,
    title: 'Golden Hour',
    category: 'Bridal',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
    price: '₹24,000',
  },
  {
    id: 4,
    title: 'Velvet Bloom',
    category: 'Occasion Wear',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80',
    price: '₹11,200',
  },
  {
    id: 5,
    title: 'Midnight Rose',
    category: 'Gown',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80',
    price: '₹18,500',
  },
  {
    id: 6,
    title: 'Celestial',
    category: 'Luxury Casual',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    price: '₹7,600',
  },
]

export default function Collection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current.children,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 80%',
            },
          }
        )
      }

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.collection-card')
        gsap.fromTo(cards,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 75%',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="collection" className="py-32 px-6 md:px-16">
      <div ref={titleRef} className="mb-20">
        <p className="text-xs tracking-[0.5em] uppercase font-body text-gold font-light mb-4">
          New Season
        </p>
        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-cream font-light leading-tight">
          The Collection
        </h2>
        <div className="mt-6 h-px w-24" style={{ background: 'var(--gold)', opacity: 0.4 }} />
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {pieces.map((piece, i) => (
          <div
            key={piece.id}
            className="collection-card group relative overflow-hidden"
            style={{ aspectRatio: i % 3 === 1 ? '3/4' : '2/3' }}
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={piece.image}
                alt={piece.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-xs tracking-[0.3em] uppercase font-body text-gold font-light mb-1">
                  {piece.category}
                </p>
                <h3 className="font-display text-2xl text-cream font-light italic mb-3">
                  {piece.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-body text-cream/60 text-sm font-light">{piece.price}</span>
                  <button className="text-xs tracking-[0.2em] uppercase font-body text-gold border border-gold/30 px-4 py-2 hover:bg-gold hover:text-bg transition-all duration-300 opacity-0 group-hover:opacity-100">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <button className="font-body text-xs tracking-[0.3em] uppercase text-cream/60 border border-cream/20 px-10 py-4 hover:border-gold hover:text-gold transition-all duration-300">
          View All Pieces
        </button>
      </div>
    </section>
  )
}
