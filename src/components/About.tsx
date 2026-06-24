'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = sectionRef.current
      if (!container) return

      const reveals = container.querySelectorAll('.reveal')
      if (reveals.length > 0) {
        gsap.fromTo(reveals,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power4.out',
            scrollTrigger: { trigger: container, start: 'top 72%' },
          }
        )
      }

      const revealImage = container.querySelector('.reveal-image')
      if (revealImage) {
        gsap.fromTo(revealImage,
          { scale: 1.08, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out',
            scrollTrigger: { trigger: container, start: 'top 80%' },
          }
        )
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" style={{ paddingTop: '3rem', paddingBottom: '3rem', paddingLeft: 'clamp(1.5rem, 3vw, 6rem)', paddingRight: 'clamp(1.5rem, 3vw, 6rem)' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="reveal-image relative overflow-hidden aspect-[4/3] lg:aspect-[2/3]">
          <Image
            src="/logo/1000346591.jpg.jpeg"
            alt="ZANKA — Beyond The Usual"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 50%)' }} />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="font-display text-4xl text-white tracking-widest">&ldquo;BEYOND THE USUAL&rdquo;</p>
          </div>
        </div>

        <div>
          <div className="reveal">
            <p className="font-body text-xs tracking-[0.4em] uppercase font-light mb-5" style={{ color: 'var(--red)' }}>Our Story</p>
          </div>
          <div className="reveal">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-white leading-none tracking-widest mb-8">
              WEAR YOUR<br />PERSONALITY
            </h2>
          </div>
          <div className="reveal h-px w-12 mb-8" style={{ background: 'var(--red)' }} />
          <div className="reveal">
            <p className="font-body text-white/50 font-light leading-relaxed mb-5">
              ZANKA was built for people who refuse to blend in. We source pop culture socks and statement fashion pieces that turn everyday outfits into conversation starters.
            </p>
          </div>
          <div className="reveal">
            <p className="font-body text-white/50 font-light leading-relaxed mb-10">
              From Pikachu on your feet to lace mandalas on your chest — every piece in our collection is chosen for one reason: it makes you feel beyond the usual.
            </p>
          </div>
          <div className="reveal flex gap-10">
            {[['50+', 'Unique Designs'], ['1000+', 'Happy Customers'], ['2', 'Categories']].map(([num, label]) => (
              <div key={label}>
                <p className="font-display text-4xl text-white tracking-widest">{num}</p>
                <p className="font-body text-xs tracking-[0.2em] uppercase text-white/30 font-light mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
