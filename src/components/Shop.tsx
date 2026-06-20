'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const socks = [
  {
    id: 'pikachu',
    name: 'Pikachu Expression Socks',
    tag: 'Pokémon',
    price: '₹249',
    usd: '$8.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.02 PM.jpeg',
    desc: 'All-over Pikachu happy faces on bright yellow. One size fits most.',
  },
  {
    id: 'pickle-rick',
    name: 'Pickle Rick Socks',
    tag: 'Rick & Morty',
    price: '₹249',
    usd: '$8.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.02 PM (1).jpeg',
    desc: 'Bold Pickle Rick graphic on vibrant green. One size fits most.',
  },
  {
    id: 'hawaiian-rick',
    name: 'Hawaiian Rick Sanchez Socks',
    tag: 'Rick & Morty',
    price: '₹249',
    usd: '$8.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.03 PM.jpeg',
    desc: 'Rick in a pink floral Hawaiian shirt. Light blue cuff, black base.',
  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper Socks',
    tag: 'One Piece',
    price: '₹299',
    usd: '$9.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.03 PM (2).jpeg',
    desc: 'Chopper in his signature pink hat & red cape on heather grey.',
  },
  {
    id: 'kuromi',
    name: 'Kuromi Neon Socks',
    tag: 'Sanrio',
    price: '₹299',
    usd: '$9.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.05 PM.jpeg',
    desc: 'Kuromi with neon pink lettering & cosmic stars on black/purple.',
  },
  {
    id: 'venom',
    name: 'Venom Socks',
    tag: 'Marvel',
    price: '₹299',
    usd: '$9.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.07 PM (1).jpeg',
    desc: 'Venom symbiote in blue & white on all-black. Dark and bold.',
  },
]

const tops = [
  {
    id: 'white-corset',
    name: 'White Ribbon-Tie Corset Top',
    tag: 'Corset',
    price: '₹999',
    usd: '$29.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.06 PM (2).jpeg',
    desc: 'Structured crop top with oversized shoulder ribbon ties & corset seam paneling.',
  },
  {
    id: 'doodle-shirt',
    name: 'Doodle Art Oversized Shirt',
    tag: 'Statement',
    price: '₹1,199',
    usd: '$34.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.04 PM.jpeg',
    desc: 'All-over black & white comic doodle print. Characters, text, dual chest pockets.',
  },
  {
    id: 'lace-mandala',
    name: 'Asymmetrical Lace Mandala Shirt',
    tag: 'Artisan',
    price: '₹1,399',
    usd: '$39.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.05 PM (1).jpeg',
    desc: 'White long-sleeve blouse with two large mandala lace appliques on the front.',
  },
  {
    id: 'brown-corset',
    name: 'Caramel Leather Corset Top',
    tag: 'Corset',
    price: '₹999',
    usd: '$29.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.05 PM (2).jpeg',
    desc: 'Strapless distressed faux-leather bustier in tan/caramel with hook-and-eye closure.',
  },
  {
    id: 'denim-corset',
    name: 'Denim Zipper Corset Top',
    tag: 'Denim',
    price: '₹999',
    usd: '$29.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.08 PM (1).jpeg',
    desc: 'Medium-wash denim bustier with front zip closure & structured panel stitching.',
  },
  {
    id: 'leopard-pants',
    name: 'Leopard Wide-Leg Trousers',
    tag: 'Bottoms',
    price: '₹799',
    usd: '$24.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.06 PM.jpeg',
    desc: 'Classic animal print wide-leg trousers in black & beige. Bold statement bottom.',
  },
  {
    id: 'gingham-top',
    name: 'Pastel Gingham Smocked Top',
    tag: 'Crop Top',
    price: '₹699',
    usd: '$19.99',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.07 PM (2).jpeg',
    desc: 'Pink & purple gingham crop top with smocked bodice & adjustable straps.',
  },
]

type Tab = 'socks' | 'tops'

export default function Shop() {
  const [activeTab, setActiveTab] = useState<Tab>('socks')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current?.querySelector('.section-title'),
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.product-card')
    gsap.fromTo(cards,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
    )
  }, [activeTab])

  const products = activeTab === 'socks' ? socks : tops

  return (
    <section ref={sectionRef} className="py-24 px-8 md:px-20 lg:px-32">
      <div id="socks" style={{ scrollMarginTop: '80px' }} />
      <div id="tops" style={{ scrollMarginTop: '80px' }} />

      <div className="section-title mb-14" style={{ opacity: 0 }}>
        <p className="font-body text-xs tracking-[0.4em] uppercase font-light mb-3" style={{ color: 'var(--red)' }}>
          The Shop
        </p>
        <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] text-white leading-none tracking-widest">
          SHOP NOW
        </h2>

        <div className="mt-8 flex gap-1 p-1 w-fit" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          {(['socks', 'tops'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="font-body text-xs tracking-[0.25em] uppercase px-6 py-2.5 transition-all duration-300 font-medium"
              style={{
                background: activeTab === tab ? 'var(--red)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {tab === 'socks' ? '🧦 Pop Culture Socks' : '👚 Statement Tops'}
            </button>
          ))}
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card group relative overflow-hidden"
            style={{ opacity: 0 }}
            onMouseEnter={() => setHoveredId(product.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 transition-all duration-500" style={{ background: hoveredId === product.id ? 'rgba(8,8,8,0.5)' : 'rgba(8,8,8,0.1)' }} />

              <div className="absolute top-3 left-3">
                <span className="font-body text-[10px] tracking-[0.2em] uppercase px-2 py-1" style={{ background: 'var(--red)', color: '#fff', fontSize: 10 }}>
                  {product.tag}
                </span>
              </div>

              <div className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-500 ${hoveredId === product.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <p className="font-body text-white/60 text-xs leading-relaxed font-light mb-3">{product.desc}</p>
                <button className="w-full font-body text-xs tracking-[0.2em] uppercase py-2.5 font-medium transition-all duration-300 hover:opacity-80" style={{ background: 'var(--red)', color: '#fff' }}>
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="pt-3 pb-1">
              <h3 className="font-body text-sm text-white font-medium leading-snug mb-1">{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="font-body text-base font-semibold" style={{ color: 'var(--red)' }}>{product.price}</span>
                <span className="font-body text-xs text-white/30 font-light">{product.usd}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
