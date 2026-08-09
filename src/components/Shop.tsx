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
  images?: string[]
  tag: string
  category_id: string
  is_sold_out?: boolean
}

interface DBCategory {
  id: string
  name: string
  slug: string
}

export default function Shop() {
  const { addToCart, setCartOpen } = useCart()
  const [categories, setCategories] = useState<DBCategory[]>([
    { id: 'tops-fallback', name: 'Statement Tops', slug: 'tops' },
    { id: 'socks-fallback', name: 'Pop Culture Socks', slug: 'socks' }
  ])
  const [products, setProducts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>('tops')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeImageIndexes, setActiveImageIndexes] = useState<{ [key: string]: number }>({})
  // Likes State & LocalStorage persistence + Real DB API tracking
  const [likedProducts, setLikedProducts] = useState<{ [key: string]: boolean }>({})
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    try {
      const storedLikes = localStorage.getItem('zanka_liked_products')
      if (storedLikes) {
        setLikedProducts(JSON.parse(storedLikes))
      }
    } catch { }
  }, [])

  const getProductLikeCount = (productId: string) => {
    if (likeCounts[productId] !== undefined) {
      return likeCounts[productId]
    }
    return 0
  }

  const toggleLike = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    const currentlyLiked = Boolean(likedProducts[productId])
    const newLikedState = !currentlyLiked

    // Optimistically update local state & storage
    setLikedProducts(prev => {
      const updated = { ...prev, [productId]: newLikedState }
      try {
        localStorage.setItem('zanka_liked_products', JSON.stringify(updated))
      } catch { }
      return updated
    })

    setLikeCounts(prev => {
      const currentCount = getProductLikeCount(productId)
      return {
        ...prev,
        [productId]: newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1)
      }
    })

    // Call API to persist in database
    try {
      const res = await fetch('/api/products/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, action: newLikedState ? 'like' : 'unlike' })
      })
      if (res.ok) {
        const data = await res.json()
        if (typeof data.likes === 'number') {
          setLikeCounts(prev => ({ ...prev, [productId]: data.likes }))
        }
      }
    } catch (err) {
      console.error('Failed to sync product like count with DB:', err)
    }
  }

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
            const sortedCategories = [...data.categories].sort((a: DBCategory, b: DBCategory) => {
              if (a.slug === 'tops') return -1
              if (b.slug === 'tops') return 1
              if (a.slug === 'socks') return 1
              if (b.slug === 'socks') return -1
              return 0
            })
            setCategories(sortedCategories)
            if (sortedCategories.some((c: DBCategory) => c.slug === 'tops')) {
              setActiveTab('tops')
            } else {
              setActiveTab(sortedCategories[0].slug)
            }
          }
          if (data.products && data.products.length > 0) {
            const mapped = data.products.map((p: DBProduct & { likes?: number }) => ({
              id: p.slug,
              name: p.name,
              tag: p.tag,
              price: `₹${p.price_inr}`,
              image: p.image_url,
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []),
              isSoldOut: Boolean(p.is_sold_out),
              desc: p.description || '',
              categorySlug: data.categories.find((c: DBCategory) => c.id === p.category_id)?.slug || '',
              likes: p.likes || 0
            }))
            setProducts(mapped)

            // Populate like counts map from DB
            const initialCounts: { [key: string]: number } = {}
            mapped.forEach((p: any) => {
              initialCounts[p.id] = p.likes || 0
            })
            setLikeCounts(prev => ({ ...initialCounts, ...prev }))
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
    if (slug === 'tops') return '👚 '
    if (slug === 'socks') return '🧦 '
    return '🛍️ '
  }

  // Helper for dynamic category badge colors
  const getCategoryBadgeStyle = (tag: string) => {
    const t = tag ? tag.toLowerCase() : ''
    if (t.includes('denim')) {
      return { background: '#00F0FF', color: '#0D0D11' } // Electric Cyan
    }
    if (t.includes('pokemon') || t.includes('pokémon')) {
      return { background: '#FFE600', color: '#0D0D11' } // Electric Yellow
    }
    if (t.includes('rick') || t.includes('morty')) {
      return { background: '#10B981', color: '#FFFFFF' } // Acid Green
    }
    if (t.includes('one piece')) {
      return { background: '#FF5722', color: '#FFFFFF' } // Warm Coral
    }
    if (t.includes('sanrio')) {
      return { background: '#EC4899', color: '#FFFFFF' } // Hot Pink
    }
    if (t.includes('marvel')) {
      return { background: '#E11D48', color: '#FFFFFF' } // Crimson
    }
    if (t.includes('bottoms') || t.includes('trousers') || t.includes('pants')) {
      return { background: '#7B2CBF', color: '#FFFFFF' } // Purple
    }
    return { background: '#FF007A', color: '#FFFFFF' } // Corset / Artisan / Pink Accent
  }

  // Fallback filtering or dynamic filtering
  let displayedProducts = []
  if (products.length > 0) {
    displayedProducts = products.filter(p => p.categorySlug === activeTab)
  } else {
    displayedProducts = activeTab === 'tops' ? tops : (activeTab === 'socks' ? socks : [])
  }

  return (
    <section ref={sectionRef} style={{ background: '#0D0D11', paddingTop: '3rem', paddingBottom: '3rem', paddingLeft: 'clamp(1.5rem, 3vw, 6rem)', paddingRight: 'clamp(1.5rem, 3vw, 6rem)' }}>
      <div id="shop" style={{ scrollMarginTop: '80px' }} />
      <div id="tops" style={{ scrollMarginTop: '80px' }} />
      <div id="socks" style={{ scrollMarginTop: '80px' }} />

      <div className="section-title mb-14">
        <p className="font-body text-xs tracking-[0.4em] uppercase font-light mb-3" style={{ color: 'var(--red)' }}>
          The Shop
        </p>
        <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] text-white leading-none tracking-widest">
          SHOP NOW
        </h2>

        <div className="mt-8 flex flex-wrap gap-2 p-1.5 w-fit" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: '2rem' }}>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveTab(cat.slug)}
              className={`font-display text-xs tracking-widest uppercase px-4 md:px-5 py-2 rounded-md transition-all duration-300 border-2 cursor-pointer ${activeTab === cat.slug
                  ? 'border-[var(--red)] bg-[var(--red)] text-white shadow-[0_5px_10px_rgba(229,33,43,0.3)]'
                  : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                }`}
            >
              <span>{getCategoryIcon(cat.slug)}{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayedProducts.map((product) => {
          // Parse images array robustly (handles arrays, JSON string, or Postgres string format)
          let productImgs: string[] = []
          if (Array.isArray(product.images) && product.images.length > 0) {
            productImgs = product.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0)
          } else if (typeof product.images === 'string' && product.images.trim().length > 0) {
            const raw = product.images.trim()
            if (raw.startsWith('[') && raw.endsWith(']')) {
              try {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) productImgs = parsed.filter((i: any) => typeof i === 'string' && i.trim().length > 0)
              } catch { }
            } else if (raw.startsWith('{') && raw.endsWith('}')) {
              productImgs = raw.substring(1, raw.length - 1).split(',').map((s: string) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
            }
          }
          if (productImgs.length === 0 && product.image) productImgs = [product.image]

          const isHovered = hoveredId === product.id
          const selectedImgIdx = activeImageIndexes[product.id] || 0
          const displayImg = isHovered && productImgs.length > 1 && selectedImgIdx === 0 ? productImgs[1] : (productImgs[selectedImgIdx] || productImgs[0])
          const isSoldOut = product.isSoldOut
          const badgeStyle = getCategoryBadgeStyle(product.tag)

          const nextImg = (e: React.MouseEvent) => {
            e.stopPropagation()
            setActiveImageIndexes(prev => ({
              ...prev,
              [product.id]: ((prev[product.id] || 0) + 1) % productImgs.length
            }))
          }

          const prevImg = (e: React.MouseEvent) => {
            e.stopPropagation()
            setActiveImageIndexes(prev => ({
              ...prev,
              [product.id]: ((prev[product.id] || 0) - 1 + productImgs.length) % productImgs.length
            }))
          }

          return (
            <div
              key={product.id}
              className="product-card group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] hover:border-[#3A3B4C] h-full"
              style={{ background: '#121217', border: '1px solid #2A2B36', borderRadius: '12px' }}
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image Container with Top-Rounded Corners */}
              <div className="relative w-full overflow-hidden rounded-t-[12px]" style={{ aspectRatio: '4/5' }}>
                <Image
                  src={displayImg}
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-500 group-hover:scale-105 ${isSoldOut ? 'opacity-55 filter grayscale-[20%]' : ''}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className={`absolute inset-0 transition-all duration-500 ${isSoldOut ? 'bg-black/40' : 'bg-black/10 md:group-hover:bg-black/20'}`} />

                {/* Top Left Accent Pill Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                  <span
                    className="font-body font-bold uppercase rounded-full shadow-md"
                    style={{
                      background: badgeStyle.background,
                      color: badgeStyle.color,
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      padding: '4px 10px'
                    }}
                  >
                    {product.tag}
                  </span>
                </div>

                {/* Sold Out or Multi-photo Tag */}
                {isSoldOut ? (
                  <div
                    className="absolute top-3 right-3 font-body font-bold uppercase rounded-full shadow-md z-10"
                    style={{
                      background: '#FF3333',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      padding: '4px 10px'
                    }}
                  >
                    SOLD OUT
                  </div>
                ) : productImgs.length > 1 && (
                  <button
                    onClick={nextImg}
                    className="absolute top-3 right-3 bg-black/80 hover:bg-[#FF007A] backdrop-blur-xs text-white text-[10px] font-body font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20 z-10 transition-colors cursor-pointer"
                    title="Click to view next photo"
                  >
                    📷 {selectedImgIdx + 1}/{productImgs.length}
                  </button>
                )}

                {/* Left/Right Carousel Controls */}
                {productImgs.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#FF007A] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
                      title="Previous Image"
                    >
                      ❮
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#FF007A] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
                      title="Next Image"
                    >
                      ❯
                    </button>
                  </>
                )}

                {/* Horizontal Dots bar */}
                {productImgs.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/60 backdrop-blur-xs px-2 py-1 rounded-full border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
                    {productImgs.map((_: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveImageIndexes(prev => ({ ...prev, [product.id]: idx }))
                        }}
                        className={`h-1.5 rounded-full transition-all ${selectedImgIdx === idx ? 'w-4 bg-[#FF007A]' : 'w-1.5 bg-white/40 hover:bg-white'
                          }`}
                        title={`View photo ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Card Body Content with Generous Side & Vertical Padding (20px / 1.25rem on all sides) */}
              <div
                className="flex flex-col justify-between flex-grow w-full"
                style={{ padding: '1.25rem', gap: '1rem' }}
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-body text-xs md:text-sm text-white font-bold leading-snug uppercase tracking-wide line-clamp-2 min-h-[2.4rem]" title={product.name}>
                    {product.name}
                  </h3>
                  {product.desc && (
                    <p className="font-body text-white/60 text-[11px] md:text-xs line-clamp-2 leading-relaxed font-light">{product.desc}</p>
                  )}

                  {/* Price & Likes Row */}
                  <div className="flex items-center justify-between pt-3 pb-1 border-t border-white/10 mt-1">
                    <span className="font-body text-base md:text-[1.25rem] font-bold tracking-tight" style={{ color: '#FF5722' }}>
                      {product.price}
                    </span>

                    {/* Interactive Product Likes (Borderless) */}
                    <button
                      onClick={(e) => toggleLike(e, product.id)}
                      className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 shadow-none cursor-pointer outline-none group/heart"
                      title={likedProducts[product.id] ? 'Unlike' : 'Like item'}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 group-hover/heart:scale-110 ${likedProducts[product.id]
                            ? 'fill-[#FF007A] stroke-[#FF007A]'
                            : 'fill-none stroke-white/60 group-hover/heart:stroke-white'
                          }`}
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className={`font-body font-bold text-xs md:text-sm ${likedProducts[product.id] ? 'text-[#FF007A]' : 'text-white/70'}`}>
                        {getProductLikeCount(product.id)}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Anchored CTA Button with Full Side Padding Breathing Space */}
                <div className="w-full mt-auto pt-1">
                  {isSoldOut ? (
                    <button
                      disabled
                      className="w-full font-body font-bold text-xs md:text-sm tracking-wider uppercase py-3 md:py-3.5 rounded-[10px] cursor-not-allowed shadow-sm border border-white/10 transition-all flex items-center justify-center gap-2"
                      style={{ background: '#262626', color: '#777777' }}
                    >
                      <span>OUT OF STOCK</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        addToCart(product)
                        setCartOpen(true)
                      }}
                      className="w-full relative overflow-hidden text-white font-body font-bold text-xs md:text-sm tracking-wider uppercase py-3 md:py-3.5 rounded-[10px] group transition-all duration-300 hover:shadow-[0_4px_20px_rgba(255,0,122,0.5)] cursor-pointer flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #FF007A, #7B2CBF)' }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        ADD TO CART
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
