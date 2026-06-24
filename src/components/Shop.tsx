'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/utils/CartContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const socks = [
  {
    id: 'pikachu',
    name: 'Pikachu Expression Socks',
    tag: 'Pokémon',
    price: '₹249',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.02 PM.jpeg',
    desc: 'All-over Pikachu happy faces on bright yellow. One size fits most.',
  },
  {
    id: 'pickle-rick',
    name: 'Pickle Rick Socks',
    tag: 'Rick & Morty',
    price: '₹249',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.02 PM (1).jpeg',
    desc: 'Bold Pickle Rick graphic on vibrant green. One size fits most.',
  },
  {
    id: 'hawaiian-rick',
    name: 'Hawaiian Rick Sanchez Socks',
    tag: 'Rick & Morty',
    price: '₹249',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.03 PM.jpeg',
    desc: 'Rick in a pink floral Hawaiian shirt. Light blue cuff, black base.',
  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper Socks',
    tag: 'One Piece',
    price: '₹299',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.03 PM (2).jpeg',
    desc: 'Chopper in his signature pink hat & red cape on heather grey.',
  },
  {
    id: 'kuromi',
    name: 'Kuromi Neon Socks',
    tag: 'Sanrio',
    price: '₹299',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.05 PM.jpeg',
    desc: 'Kuromi with neon pink lettering & cosmic stars on black/purple.',
  },
  {
    id: 'venom',
    name: 'Venom Socks',
    tag: 'Marvel',
    price: '₹299',
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
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.06 PM (2).jpeg',
    desc: 'Structured crop top with oversized shoulder ribbon ties & corset seam paneling.',
  },
  {
    id: 'doodle-shirt',
    name: 'Doodle Art Oversized Shirt',
    tag: 'Statement',
    price: '₹1,199',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.04 PM.jpeg',
    desc: 'All-over black & white comic doodle print. Characters, text, dual chest pockets.',
  },
  {
    id: 'lace-mandala',
    name: 'Asymmetrical Lace Mandala Shirt',
    tag: 'Artisan',
    price: '₹1,399',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.05 PM (1).jpeg',
    desc: 'White long-sleeve blouse with two large mandala lace appliques on the front.',
  },
  {
    id: 'brown-corset',
    name: 'Caramel Leather Corset Top',
    tag: 'Corset',
    price: '₹999',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.05 PM (2).jpeg',
    desc: 'Strapless distressed faux-leather bustier in tan/caramel with hook-and-eye closure.',
  },
  {
    id: 'denim-corset',
    name: 'Denim Zipper Corset Top',
    tag: 'Denim',
    price: '₹999',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.08 PM (1).jpeg',
    desc: 'Medium-wash denim bustier with front zip closure & structured panel stitching.',
  },
  {
    id: 'leopard-pants',
    name: 'Leopard Wide-Leg Trousers',
    tag: 'Bottoms',
    price: '₹799',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.06 PM.jpeg',
    desc: 'Classic animal print wide-leg trousers in black & beige. Bold statement bottom.',
  },
  {
    id: 'gingham-top',
    name: 'Pastel Gingham Smocked Top',
    tag: 'Crop Top',
    price: '₹699',
    image: '/products/WhatsApp Image 2026-06-20 at 12.24.07 PM (2).jpeg',
    desc: 'Pink & purple gingham crop top with smocked bodice & adjustable straps.',
  },
]

interface DBProduct {
  id: string
  slug: string
  name: string
  description: string
  price_inr: number
  price_usd: number
  image_url: string
  tag: string
  category_id: string
}

interface DBCategory {
  id: string
  name: string
  slug: string
}

export default function Shop() {
  const { addToCart, setCartOpen } = useCart()
  const [categories, setCategories] = useState<DBCategory[]>([
    { id: 'socks-fallback', name: 'Pop Culture Socks', slug: 'socks' },
    { id: 'tops-fallback', name: 'Statement Tops', slug: 'tops' }
  ])
  const [products, setProducts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>('socks')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories)
            if (data.categories.some((c: DBCategory) => c.slug === 'socks')) {
              setActiveTab('socks')
            } else {
              setActiveTab(data.categories[0].slug)
            }
          }
          if (data.products && data.products.length > 0) {
            const mapped = data.products.map((p: DBProduct) => ({
              id: p.slug,
              name: p.name,
              tag: p.tag,
              price: `₹${p.price_inr}`,
              image: p.image_url,
              desc: p.description || '',
              categorySlug: data.categories.find((c: DBCategory) => c.id === p.category_id)?.slug || ''
            }))
            setProducts(mapped)
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic shop products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = sectionRef.current
      if (!container) return
      const title = container.querySelector('.section-title')
      if (title) {
        gsap.fromTo(title,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
            scrollTrigger: { trigger: container, start: 'top 80%' },
          }
        )
      }
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
  }, [activeTab, products])

  // Get categories emoji/icons mapping helper
  const getCategoryIcon = (slug: string) => {
    if (slug === 'socks') return '🧦 '
    if (slug === 'tops') return '👚 '
    return '🛍️ '
  }

  // Fallback filtering or dynamic filtering
  let displayedProducts = []
  if (products.length > 0) {
    displayedProducts = products.filter(p => p.categorySlug === activeTab)
  } else {
    displayedProducts = activeTab === 'socks' ? socks : (activeTab === 'tops' ? tops : [])
  }

  return (
    <section ref={sectionRef} style={{ paddingTop: '3rem', paddingBottom: '3rem', paddingLeft: 'clamp(1.5rem, 3vw, 6rem)', paddingRight: 'clamp(1.5rem, 3vw, 6rem)' }}>
      <div id="socks" style={{ scrollMarginTop: '80px' }} />
      <div id="tops" style={{ scrollMarginTop: '80px' }} />

      <div className="section-title mb-14" style={{ opacity: 0 }}>
        <p className="font-body text-xs tracking-[0.4em] uppercase font-light mb-3" style={{ color: 'var(--red)' }}>
          The Shop
        </p>
        <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] text-white leading-none tracking-widest">
          SHOP NOW
        </h2>

        <div className="mt-8 flex flex-wrap gap-1 p-1 w-fit" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: '1.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveTab(cat.slug)}
              className={`font-display text-sm md:text-base tracking-widest uppercase px-8 py-3 rounded-md transition-all duration-300 border-2 ${
                activeTab === cat.slug 
                  ? 'border-[var(--red)] bg-[var(--red)] text-white shadow-[0_5px_20px_rgba(229,33,43,0.4)]' 
                  : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
              }`}
            >
              {getCategoryIcon(cat.slug)}{cat.name}
            </button>
          ))}
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayedProducts.map((product) => (
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
                <button
                  onClick={() => {
                    addToCart(product)
                    setCartOpen(true)
                  }}
                  className="w-full relative overflow-hidden bg-[var(--red)] text-white font-display text-base tracking-[0.15em] uppercase py-3.5 rounded-md group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(229,33,43,0.5)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    ADD TO CART
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                </button>
              </div>
            </div>

            <div className="pt-3 pb-1">
              <h3 className="font-body text-sm text-white font-medium leading-snug mb-1">{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="font-body text-base font-semibold" style={{ color: 'var(--red)' }}>{product.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
