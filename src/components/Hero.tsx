'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

const TAGLINE = 'BEYOND THE USUAL'

const VALUE_PROPS = [
  { icon: '✦', text: 'Branded & Unique Finds' },
  { icon: '♡', text: 'Handpicked With Care' },
  { icon: '✧', text: '₹150 – ₹600' },
  { icon: '◎', text: 'Pre-loved Fashion' },
]

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const zankaRef = useRef<HTMLHeadingElement>(null)
  const lettersRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const disclaimerRef = useRef<HTMLParagraphElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 6
    camera.position.y = 1.5
    camera.lookAt(0, 0, 0)

    // Columns and rows for a structured dynamic grid mesh — reduced on mobile for performance
    const isMobileView = window.innerWidth < 768
    const columns = isMobileView ? 40 : 75
    const rows = isMobileView ? 25 : 45
    const count = columns * rows
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const i = x * rows + y
        positions[i * 3] = (x - columns / 2) * 0.28
        positions[i * 3 + 1] = (y - rows / 2) * 0.24
        positions[i * 3 + 2] = 0

        const isRed = Math.random() > 0.88
        if (isRed) {
          colors[i * 3] = 0.90   // Red
          colors[i * 3 + 1] = 0.13
          colors[i * 3 + 2] = 0.17
        } else {
          colors[i * 3] = 0.45   // Soft Slate/White
          colors[i * 3 + 1] = 0.45
          colors[i * 3 + 2] = 0.48
        }
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const createCircleTexture = () => {
      const c = document.createElement('canvas')
      c.width = 32
      c.height = 32
      const ctx = c.getContext('2d')
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(16, 16, 16, 0, Math.PI * 2)
        ctx.fill()
      }
      return new THREE.CanvasTexture(c)
    }

    const mat = new THREE.PointsMaterial({
      size: isMobileView ? 0.15 : 0.12,
      map: createCircleTexture(),
      transparent: true,
      opacity: isMobileView ? 0.6 : 0.5,
      vertexColors: true,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geo, mat)
    particles.rotation.x = -0.8
    scene.add(particles)

    let mouseX = 0, mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5)
      mouseY = -(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let animId: number
    let elapsed = 0
    let lastTime = performance.now()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const now = performance.now()
      elapsed += (now - lastTime) / 1000
      lastTime = now

      const pos = geo.attributes.position.array as Float32Array
      for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
          const i = x * rows + y

          const xAngle = (x * 0.12) + elapsed * 1.6
          const yAngle = (y * 0.15) + elapsed * 1.3

          let z = Math.sin(xAngle) * 0.45 + Math.cos(yAngle) * 0.35

          const px = pos[i * 3]
          const py = pos[i * 3 + 1]

          const targetX = mouseX * 12
          const targetY = mouseY * 8
          const dist = Math.sqrt((px - targetX) ** 2 + (py - targetY) ** 2)

          if (dist < 5) {
            z += (5 - dist) * 0.35 * Math.sin(elapsed * 5 - dist)
          }

          pos[i * 3 + 2] = z
        }
      }
      geo.attributes.position.needsUpdate = true

      particles.rotation.z = elapsed * 0.015
      particles.rotation.y = elapsed * 0.01 + mouseX * 0.25
      particles.rotation.x = -0.8 + mouseY * 0.2

      renderer.render(scene, camera)
    }
    animate()

    const tl = gsap.timeline({ delay: 0.15 })

    if (zankaRef.current) {
      tl.fromTo(zankaRef.current,
        { opacity: 0, scale: 0.82, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'expo.out' }
      )
    }

    if (lettersRef.current) {
      const letters = lettersRef.current.querySelectorAll('.letter')
      tl.fromTo(letters,
        { y: '110%', opacity: 0, rotateX: -80 },
        {
          y: '0%',
          opacity: 1,
          rotateX: 0,
          duration: 0.65,
          stagger: 0.038,
          ease: 'back.out(1.4)',
        },
        '-=0.5'
      )
    }

    if (subRef.current) {
      tl.fromTo(subRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.15'
      )
    }

    if (headingRef.current) {
      tl.fromTo(headingRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out' },
        '-=0.4'
      )
    }

    if (descRef.current) {
      tl.fromTo(descRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
        '-=0.3'
      )
    }

    if (propsRef.current) {
      tl.fromTo(propsRef.current.children,
        { opacity: 0, y: 16, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.2)' },
        '-=0.3'
      )
    }

    if (ctaRef.current) {
      tl.fromTo(ctaRef.current.children,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
        '-=0.2'
      )
    }

    if (disclaimerRef.current) {
      tl.fromTo(disclaimerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.2'
      )
    }

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
    }
  }, [])

  return (
    <section className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(229,33,43,0.06) 0%, rgba(8,8,8,0.7) 55%, rgba(8,8,8,0.96) 100%)' }}
      />

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 flex flex-col justify-between lg:justify-center h-full pt-10 sm:pt-14 pb-4 lg:py-0">

        {/* Top/Middle Group: Logo + Content */}
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-1 lg:gap-0 w-full max-w-[1400px] mx-auto">

          {/* LEFT — Logo (60%) */}
          <div
            ref={zankaRef}
            className="select-none flex items-center justify-center lg:justify-center w-full lg:w-[60%] lg:flex-shrink-0 -mt-2 sm:mt-0"
            style={{ opacity: 0 }}
          >
            <div
              style={{
                width: isMobile ? 'clamp(310px, 88vw, 450px)' : 'clamp(240px, 75vw, 720px)',
                filter: 'drop-shadow(0 0 90px rgba(229,33,43,0.3)) drop-shadow(0 4px 50px rgba(0,0,0,0.5))',
              }}
            >
              <img
                src="/logo/zanka-logo-withoutbackground.png"
                alt="ZANKA"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>

          {/* RIGHT — Content (40%) */}
          <div
            className="w-full lg:w-[40%] flex flex-col items-center lg:items-start text-center lg:text-left -mt-16 sm:-mt-16 lg:mt-0"
          >

            {/* Red accent line + Eyebrow badge */}
            <div className="flex items-center gap-2 mb-1 lg:mb-[6px]" style={{ opacity: 0 }} ref={subRef}>
              <div className="hidden lg:block w-8 h-[2px]" style={{ background: 'var(--red)' }} />
              <p
                className="font-body text-xs font-bold tracking-[0.12em] uppercase"
                style={{ color: 'var(--red)', letterSpacing: '0.12em', marginBottom: isMobile ? '2px' : '6px' }}
              >
                THRIFTED FASHION
              </p>
            </div>

            {/* Heading */}
            <h1
              ref={headingRef}
              className="font-display text-white tracking-wider mb-1.5 lg:mb-2 font-bold"
              style={{ fontSize: isMobile ? 'clamp(1.45rem, 5.8vw, 1.95rem)' : 'clamp(1.8rem, 6vw, 2.5rem)', lineHeight: 1.15, opacity: 0 }}
            >
              HANDPICKED<br className="hidden sm:inline" /> THRIFTED DRESSES
            </h1>

            {/* Description Subtext */}
            <div ref={descRef} className="space-y-1 lg:space-y-1.5" style={{ margin: isMobile ? '6px 0 10px' : '12px 0 16px' }}>
              <p
                className="font-body text-white/85 text-xs sm:text-sm font-normal leading-relaxed max-w-xs sm:max-w-sm"
                style={{ opacity: 0 }}
              >
                Discover handpicked thrifted dresses from different brands.
                Every piece is carefully selected for the best style and quality.
              </p>
              <p
                className="font-body text-white/40 text-[10px] md:text-xs font-light leading-normal max-w-sm hidden sm:block"
                style={{ opacity: 0 }}
              >
                Minor flaws may exist on pre-loved items and will be mentioned.
              </p>
            </div>

            {/* Value Proposition Pills & Tags */}
            <div ref={propsRef} className="flex flex-wrap justify-center lg:justify-start items-center gap-1.5 lg:gap-2 mb-2 lg:mb-5 max-w-sm">
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.text}
                  className="hero-pill font-body tracking-wider uppercase px-2.5 py-1 lg:px-3 lg:py-1 font-medium flex items-center gap-1.5 leading-normal"
                  style={{
                    opacity: 0,
                    background: 'rgba(229, 33, 43, 0.08)',
                    border: '1px solid rgba(229, 33, 43, 0.25)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '100px',
                    fontSize: isMobile ? '0.72rem' : '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--red)', fontSize: '0.9em' }}>{prop.icon}</span>
                  <span>{prop.text}</span>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <p
              ref={disclaimerRef}
              className="font-body text-white/35 text-[9px] lg:text-[9px] tracking-[0.1em] uppercase font-light leading-relaxed"
              style={{ opacity: 0 }}
            >
              Pre-loved items — we strive to bring you the best quality
            </p>
          </div>
        </div>

        {/* Bottom Section: Tagline + Shop Now (Separated at the bottom) */}
        <div className="w-full flex flex-col items-center gap-2 lg:gap-0 mt-auto lg:mt-0">
          {/* Bottom Tagline — Full Width Centered */}
          <div className="w-full max-w-[1400px] mx-auto lg:mt-8">
            <div
              ref={lettersRef}
              className="overflow-hidden flex flex-wrap justify-center"
              style={{ perspective: '600px' }}
              aria-label={TAGLINE}
            >
              {TAGLINE.split('').map((char, i) => (
                <span
                  key={i}
                  className="letter font-display text-white/90 leading-none"
                  style={{
                    display: 'inline-block',
                    fontSize: isMobile ? 'clamp(0.7rem, 2.8vw, 0.9rem)' : 'clamp(1rem, 2.8vw, 2.4rem)',
                    letterSpacing: isMobile ? '0.18em' : '0.25em',
                    opacity: 0,
                    marginRight: char === ' ' ? '0.6em' : undefined,
                  }}
                >
                  {char === ' ' ? ' ' : char}
                </span>
              ))}
            </div>
          </div>

          {/* Primary CTA Placement (Shop Now Button) */}
          <div ref={ctaRef} className="relative mt-2 lg:absolute lg:mt-0 lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2 flex flex-col items-center gap-2 lg:gap-3 z-20 w-full lg:w-auto">
            <a
              href="#socks"
              className="relative inline-flex items-center justify-center font-display text-xs md:text-sm tracking-widest uppercase text-white bg-[var(--red)] rounded-md overflow-hidden group transition-all duration-300 hover:shadow-[0_10px_40px_rgba(229,33,43,0.6)] cursor-pointer active:scale-95"
              style={{
                width: '80%',
                maxWidth: isMobile ? '240px' : '280px',
                minHeight: isMobile ? '45px' : '48px',
                padding: isMobile ? '0.7rem 1.4rem' : '0.75rem 1.5rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span className="relative z-10 font-bold tracking-wider">SHOP NOW</span>
              <div className="absolute inset-0 bg-white/20 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            </a>
            <div className="animate-bounce-arrow hidden lg:block">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M5 11l5 5 5-5" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
