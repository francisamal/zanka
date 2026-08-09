'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Review {
  id: string
  customer_name: string
  rating: number
  review_text: string
  product_name?: string
  image_url?: string
  created_at: string
}

interface CommunityPost {
  id: string
  author_name: string
  content: string
  image_url?: string
  instagram_handle?: string
  created_at: string
}

// Fallback data in case DB isn't seeded yet
const fallbackReviews: Review[] = [
  {
    id: 'fb-1',
    customer_name: 'Priya M.',
    rating: 5,
    review_text: 'Got the cutest floral dress for just ₹350! The quality is amazing for a thrifted piece. Absolutely love the handpicked collection.',
    product_name: 'Floral Summer Dress',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fb-2',
    customer_name: 'Ananya S.',
    rating: 4,
    review_text: 'Found a beautiful branded dress that still had the tags on! Minor loose thread on the hem but it was mentioned before I bought it. Super transparent and trustworthy.',
    product_name: 'Branded A-Line Dress',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fb-3',
    customer_name: 'Ritika K.',
    rating: 5,
    review_text: 'I was skeptical about thrifted clothes but ZANKA changed my mind. The dress I got looks brand new and cost me only ₹200. 10/10 recommend!',
    product_name: 'Polka Dot Mini Dress',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fb-4',
    customer_name: 'Meera J.',
    rating: 5,
    review_text: 'Affordable and stylish — my two favorite words! Got 3 dresses under ₹1000 total. Each one is unique and well-maintained.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fb-5',
    customer_name: 'Sneha R.',
    rating: 4,
    review_text: 'Love the concept of handpicked thrifted fashion. The bodycon dress I ordered fits perfectly and the material feels premium.',
    product_name: 'Black Bodycon Dress',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fb-6',
    customer_name: 'Divya P.',
    rating: 5,
    review_text: 'Best thrift store online! Every dress is carefully selected. Got a stunning maxi dress for ₹450. My friends couldn\'t believe it was thrifted!',
    product_name: 'Maxi Dress',
    created_at: new Date().toISOString(),
  },
]

const fallbackPosts: CommunityPost[] = [
  {
    id: 'fp-1',
    author_name: 'Kavya D.',
    content: 'Styled my ZANKA thrift find for a brunch date! This ₹300 dress is getting more compliments than my designer pieces 😍',
    instagram_handle: '@kavya.styles',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fp-2',
    author_name: 'Roshni T.',
    content: 'Thrifting is not just budget-friendly, it\'s planet-friendly! Loving my pre-loved finds from ZANKA. Each piece tells a story 🌿✨',
    instagram_handle: '@roshni.thrifts',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fp-3',
    author_name: 'Aisha N.',
    content: 'My entire outfit today cost less than ₹500 thanks to ZANKA! Who says you can\'t look expensive on a budget? 💅',
    instagram_handle: '@aisha.ootd',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fp-4',
    author_name: 'Tanvi M.',
    content: 'Just received my ZANKA package and the curation is *chef\'s kiss*! Every dress is handpicked and it shows. Already planning my next order 🛍️',
    created_at: new Date().toISOString(),
  },
]

function StarRating({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-[13px] transition-all duration-200 ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
          style={{
            color: (interactive ? (hovered || rating) : rating) >= star ? '#e5212b' : 'rgba(255,255,255,0.15)',
            background: 'none',
            border: 'none',
            padding: '1px',
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="feed-card w-full h-full break-inside-avoid mb-6 md:mb-8 group relative overflow-hidden p-[2rem] flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(229,33,43,0.15)] border border-[rgba(229,33,43,0.4)] hover:border-[var(--red)] rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, rgba(229,33,43,0.03), rgba(255,255,255,0.01))',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(229,33,43,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-body text-sm font-semibold flex-shrink-0 shadow-[0_0_15px_rgba(229,33,43,0.15)]"
                style={{
                  background: 'linear-gradient(135deg, var(--red), #8a0c14)',
                  color: '#fff',
                }}
              >
                {review.customer_name.charAt(0)}
              </div>
              <div>
                <p className="font-body text-[15px] text-white font-medium">{review.customer_name}</p>
                {review.product_name && (
                  <p className="font-body text-[10px] tracking-wider uppercase text-white/40 mt-0.5">{review.product_name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <StarRating rating={review.rating} />
          </div>

          <p className="font-body text-[14px] text-white/80 font-light leading-relaxed mb-6">
            &ldquo;{review.review_text}&rdquo;
          </p>

          {review.image_url && (
            <div className="relative w-full overflow-hidden rounded-xl mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)]" style={{ aspectRatio: '4/5' }}>
              <img
                src={review.image_url}
                alt={`Review by ${review.customer_name}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          )}
        </div>

        <div className="pt-5 border-t border-white/5 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
            <span className="font-body text-[10px] tracking-widest uppercase text-white/30">Verified</span>
          </div>
          <span className="font-body text-[10px] tracking-widest uppercase text-white/20">
            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <div
      className="feed-card w-full h-full break-inside-avoid mb-6 group relative p-[2rem] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between overflow-hidden hover:shadow-[0_10px_40px_rgba(229,33,43,0.15)] border border-[rgba(229,33,43,0.4)] hover:border-[var(--red)] rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, rgba(229,33,43,0.03), rgba(255,255,255,0.01))',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(229,33,43,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-3.5 mb-5">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-body text-sm font-semibold shadow-[0_0_15px_rgba(229,33,43,0.15)]"
              style={{
                background: 'linear-gradient(135deg, rgba(229,33,43,0.2), rgba(180,80,200,0.15))',
                color: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {post.author_name.charAt(0)}
            </div>
            <div>
              <p className="font-body text-[15px] text-white font-medium">{post.author_name}</p>
              {post.instagram_handle && (
                <p className="font-body text-[10px] tracking-wider text-white/40 mt-0.5">{post.instagram_handle}</p>
              )}
            </div>
          </div>

          <p className="font-body text-[14px] text-white/80 font-light leading-relaxed mb-6">
            {post.content}
          </p>

          {post.image_url && (
            <div className="relative w-full overflow-hidden rounded-xl mb-6 shadow-lg" style={{ aspectRatio: '4/5' }}>
              <img src={post.image_url} alt="Community post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
          <span
            className="font-body text-[10px] tracking-[0.15em] uppercase px-4 py-2 rounded-full font-medium"
            style={{
              background: 'rgba(229,33,43,0.1)',
              border: '1px solid rgba(229,33,43,0.2)',
              color: 'rgba(229,33,43,0.9)',
            }}
          >
            Community
          </span>
          <span className="font-body text-xs tracking-widest uppercase text-white/20">
            {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}
function SkeletonCard() {
  return (
    <div
      className="feed-card animate-pulse p-6 md:p-8 rounded-2xl border"
      style={{
        background: 'rgba(229,33,43,0.02)',
        borderColor: 'rgba(229,33,43,0.2)',
        height: '240px',
        padding: '2rem',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-white/5" />
        <div className="flex-1">
          <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
          <div className="h-2 bg-white/5 rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 bg-white/10 rounded w-full mb-2.5" />
      <div className="h-3 bg-white/10 rounded w-5/6 mb-2.5" />
      <div className="h-3 bg-white/10 rounded w-2/3" />
    </div>
  )
}

export default function Feeds() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'reviews' | 'posts'>('reviews')
  const [reviews, setReviews] = useState<Review[]>([])
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'review' | 'post'>('review')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [formText, setFormText] = useState('')
  const [formProduct, setFormProduct] = useState('')
  const [formHandle, setFormHandle] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const res = await fetch('/api/feeds')
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews ?? [])
          setPosts(data.posts ?? [])
        }
      } catch (err) {
        console.error('Failed to load feeds:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFeeds()
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
    const cards = gridRef.current.querySelectorAll('.feed-card')
    gsap.killTweensOf(cards)
    gsap.fromTo(cards,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out', clearProps: 'all' }
    )
  }, [activeTab, reviews, posts])

  const resetForm = () => {
    setFormName('')
    setFormRating(5)
    setFormText('')
    setFormProduct('')
    setFormHandle('')
    setFormImageUrl('')
    setSubmitted(false)
  }

  const openModal = (mode: 'review' | 'post') => {
    setModalMode(mode)
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const body = modalMode === 'review'
        ? {
            type: 'review',
            customer_name: formName,
            rating: formRating,
            review_text: formText,
            product_name: formProduct || undefined,
            image_url: formImageUrl || undefined,
          }
        : {
            type: 'post',
            author_name: formName,
            content: formText,
            instagram_handle: formHandle || undefined,
            image_url: formImageUrl || undefined,
          }

      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        if (modalMode === 'review' && data.data) {
          setReviews(prev => [data.data, ...prev])
        } else if (modalMode === 'post' && data.data) {
          setPosts(prev => [data.data, ...prev])
        }
        setSubmitted(true)
        setTimeout(() => {
          closeModal()
          setActiveTab(modalMode === 'review' ? 'reviews' : 'posts')
        }, 2000)
      } else {
        const err = await res.json()
        alert(err.error || 'Something went wrong')
      }
    } catch (err) {
      console.error('Submit error:', err)
      alert('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const reviewsWithoutImage = reviews.filter(r => !r.image_url)
  const reviewsWithImage = reviews.filter(r => !!r.image_url)

  return (
    <>
      <section
        ref={sectionRef}
        id="feeds"
        style={{
          paddingTop: '3rem',
          paddingBottom: '4rem',
          paddingLeft: 'clamp(1.5rem, 3vw, 6rem)',
          paddingRight: 'clamp(1.5rem, 3vw, 6rem)',
        }}
      >
        {/* Header */}
        <div className="section-title mb-12" style={{ opacity: 0 }}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="font-body text-xs tracking-[0.4em] uppercase font-light mb-3" style={{ color: 'var(--red)' }}>
                Community
              </p>
              <h2 className="font-display text-[clamp(2rem,6vw,5rem)] text-white leading-none tracking-widest">
                THE FEED
              </h2>
              <p className="font-body text-sm text-white/35 font-light mt-3 max-w-lg">
                Real stories from our community. See what others are saying and share your own experience.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openModal('review')}
                className="relative inline-flex items-center justify-center gap-2 bg-[var(--red)] text-white font-display text-xs md:text-sm tracking-[0.15em] uppercase rounded-md overflow-hidden group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(229,33,43,0.5)] hover:-translate-y-1"
                style={{ padding: '0.5rem 1.25rem', whiteSpace: 'nowrap' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="group-hover:rotate-12 transition-transform duration-300">★</span> Write a Review
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
              <button
                onClick={() => openModal('post')}
                className="relative inline-flex items-center justify-center gap-2 bg-transparent text-white/70 font-display text-xs md:text-sm tracking-[0.15em] uppercase rounded-md border-2 border-white/20 overflow-hidden group transition-all duration-300 hover:border-white hover:text-white hover:-translate-y-1"
                style={{ padding: '0.5rem 1.25rem', whiteSpace: 'nowrap' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="group-hover:rotate-90 transition-transform duration-300">✦</span> Post Your Look
                </span>
              </button>
            </div>
          </div>

          {/* Premium Tabs */}
          <div className="mt-12 flex gap-8 md:gap-14 border-b border-white/10 pb-4 w-full md:w-auto overflow-x-auto no-scrollbar" style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`font-display text-2xl md:text-3xl tracking-widest uppercase transition-all duration-500 relative flex items-center gap-3 shrink-0 ${
                activeTab === 'reviews' ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <span>Reviews</span>
              <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-white/10">{reviews.length}</span>
              {activeTab === 'reviews' && (
                <span className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-[var(--red)] shadow-[0_0_10px_rgba(229,33,43,0.8)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`font-display text-2xl md:text-3xl tracking-widest uppercase transition-all duration-500 relative flex items-center gap-3 shrink-0 ${
                activeTab === 'posts' ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <span>Community</span>
              <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-white/10">{posts.length}</span>
              {activeTab === 'posts' && (
                <span className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-[var(--red)] shadow-[0_0_10px_rgba(229,33,43,0.8)]" />
              )}
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div ref={gridRef} className="w-full">
          {loading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 w-full">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : activeTab === 'reviews' ? (
            reviews.length > 0 ? (
              <div className="flex flex-col gap-14">
                {reviewsWithoutImage.length > 0 && (
                  <div>
                    <div
                      className="flex gap-3 md:gap-4 w-full overflow-x-auto snap-x snap-mandatory items-start"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent', padding: '0.5rem 0.25rem 1rem 0.25rem' }}
                    >
                      {reviewsWithoutImage.map((review) => (
                        <div key={review.id} className="w-[85vw] sm:w-[280px] md:w-[320px] shrink-0 snap-start flex">
                          <ReviewCard review={review} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reviewsWithImage.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                      <h3 className="font-display text-2xl text-white/80 tracking-widest uppercase">Customer Photos</h3>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div
                      className="flex gap-3 md:gap-4 w-full overflow-x-auto snap-x snap-mandatory items-start"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent', padding: '0.5rem 0.25rem 1rem 0.25rem' }}
                    >
                      {reviewsWithImage.map((review) => (
                        <div key={review.id} className="w-[85vw] sm:w-[280px] md:w-[320px] shrink-0 snap-start flex">
                          <ReviewCard review={review} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <div className="text-3xl mb-3" style={{ color: 'var(--red)' }}>★</div>
                <p className="font-body text-sm text-white/40 font-light mb-4">No reviews yet. Be the first to share your experience!</p>
                <button
                  onClick={() => openModal('review')}
                  className="relative inline-flex items-center justify-center gap-2 bg-[var(--red)] text-white font-display text-xs md:text-sm tracking-[0.15em] uppercase rounded-md overflow-hidden group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(229,33,43,0.5)] hover:-translate-y-1 mx-auto"
                  style={{ padding: '0.5rem 1.25rem', whiteSpace: 'nowrap' }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="group-hover:rotate-12 transition-transform duration-300">★</span> Write a Review
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </button>
              </div>
            )
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 w-full">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <div className="text-3xl mb-3" style={{ color: 'var(--red)' }}>✦</div>
                  <p className="font-body text-sm text-white/40 font-light mb-4">No community posts yet. Share your outfit look!</p>
                  <button
                    onClick={() => openModal('post')}
                    className="relative inline-flex items-center justify-center gap-2 bg-transparent text-white/70 font-display text-xs md:text-sm tracking-[0.15em] uppercase rounded-md border-2 border-white/20 overflow-hidden group transition-all duration-300 hover:border-white hover:text-white hover:-translate-y-1 mx-auto"
                    style={{ padding: '0.5rem 1.25rem', whiteSpace: 'nowrap' }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="group-hover:rotate-90 transition-transform duration-300">✦</span> Post Your Look
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Instagram Link */}
        <div className="mt-10 flex justify-center">
          <a
            href="https://www.instagram.com/wardrobeofzanka"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase text-white/30 hover:text-white transition-colors duration-300"
          >
            <span>@wardrobeofzanka</span>
            <span className="w-8 h-px" style={{ background: 'var(--red)' }} />
          </a>
        </div>
      </section>

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(20,20,20,0.95)',
              border: '1px solid rgba(229,33,43,0.15)',
              borderRadius: '16px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(229,33,43,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              ✕
            </button>

            {submitted ? (
              /* Success State */
              <div className="p-10 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(229,33,43,0.15)' }}
                >
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="font-display text-3xl text-white tracking-widest mb-3">THANK YOU!</h3>
                <p className="font-body text-sm text-white/50 font-light">
                  {modalMode === 'review'
                    ? 'Your review has been published. We appreciate your feedback!'
                    : 'Your post has been published. Thanks for sharing!'
                  }
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-7 md:p-8">
                <div className="mb-7">
                  <p className="font-body text-[10px] tracking-[0.4em] uppercase font-light mb-2" style={{ color: 'var(--red)' }}>
                    {modalMode === 'review' ? 'Write a Review' : 'Post Your Look'}
                  </p>
                  <h3 className="font-display text-2xl text-white tracking-widest">
                    {modalMode === 'review' ? 'SHARE YOUR EXPERIENCE' : 'SHARE YOUR STYLE'}
                  </h3>
                </div>

                {/* Mode Toggle */}
                <div
                  className="flex gap-1 p-1 mb-6"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '100px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setModalMode('review')}
                    className="flex-1 font-body text-[10px] tracking-[0.15em] uppercase py-2 transition-all duration-300 font-medium"
                    style={{
                      background: modalMode === 'review' ? 'var(--red)' : 'transparent',
                      color: modalMode === 'review' ? '#fff' : 'rgba(255,255,255,0.4)',
                      borderRadius: '100px',
                    }}
                  >
                    ★ Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode('post')}
                    className="flex-1 font-body text-[10px] tracking-[0.15em] uppercase py-2 transition-all duration-300 font-medium"
                    style={{
                      background: modalMode === 'post' ? 'var(--red)' : 'transparent',
                      color: modalMode === 'post' ? '#fff' : 'rgba(255,255,255,0.4)',
                      borderRadius: '100px',
                    }}
                  >
                    ✦ Post
                  </button>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Priya M."
                    className="w-full font-body text-base md:text-sm text-white placeholder-white/20 py-3 px-4 outline-none transition-all duration-300 focus:border-red/40"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                {/* Rating (review only) */}
                {modalMode === 'review' && (
                  <div className="mb-4">
                    <label className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-2">
                      Rating *
                    </label>
                    <div className="flex items-center gap-3">
                      <StarRating rating={formRating} interactive onRate={setFormRating} />
                      <span className="font-body text-xs text-white/30">{formRating}/5</span>
                    </div>
                  </div>
                )}

                {/* Text */}
                <div className="mb-4">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-2">
                    {modalMode === 'review' ? 'Your Review *' : 'Your Post *'}
                  </label>
                  <textarea
                    required
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder={modalMode === 'review' ? 'Tell us about your experience...' : 'Share your style story...'}
                    rows={4}
                    className="w-full font-body text-base md:text-sm text-white placeholder-white/20 py-3 px-4 outline-none transition-all duration-300 focus:border-red/40 resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                {/* Product Name (review only) */}
                {modalMode === 'review' && (
                  <div className="mb-4">
                    <label className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-2">
                      Product Name <span className="text-white/20">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      placeholder="e.g., Floral Summer Dress"
                      className="w-full font-body text-base md:text-sm text-white placeholder-white/20 py-3 px-4 outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                )}

                {/* Instagram Handle (post only) */}
                {modalMode === 'post' && (
                  <div className="mb-4">
                    <label className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-2">
                      Instagram Handle <span className="text-white/20">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formHandle}
                      onChange={(e) => setFormHandle(e.target.value)}
                      placeholder="e.g., @your.handle"
                      className="w-full font-body text-base md:text-sm text-white placeholder-white/20 py-3 px-4 outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                )}

                {/* Image URL */}
                <div className="mb-6">
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium block mb-2">
                    Image URL <span className="text-white/20">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Paste an image link..."
                    className="w-full font-body text-base md:text-sm text-white placeholder-white/20 py-3 px-4 outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="relative w-full overflow-hidden bg-[var(--red)] text-white font-display text-base tracking-[0.15em] uppercase py-4 rounded-md group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(229,33,43,0.5)] disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <span className="relative z-10">
                    {submitting ? 'SUBMITTING...' : (modalMode === 'review' ? 'SUBMIT REVIEW' : 'PUBLISH POST')}
                  </span>
                  {!submitting && <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />}
                </button>

                <p className="font-body text-[10px] text-white/20 text-center mt-4 font-light">
                  By submitting, you agree to share your experience with the ZANKA community.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
