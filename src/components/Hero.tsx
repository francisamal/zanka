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
        style={{ background: 'radial-gradient(ellipse at center, rgba(229,33,43,0.08) 0%, rgba(8,8,8,0.72) 50%, rgba(8,8,8,0.98) 100%)' }}
      />

      <div className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto lg:justify-center">

        {/* 10% TOP BLANK SPACE on Mobile (Clears floating nav) */}
        <div className="h-[10%] lg:hidden w-full shrink-0" />

        {/* DESKTOP + MOBILE COMBINED ROW (70% total on mobile: 20% Logo + 50% Content) */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full lg:gap-12 h-[70%] lg:h-auto shrink-0">

          {/* 20% SPACE FOR LOGO on Mobile / 54% Left Column on Desktop */}
          <div
            ref={zankaRef}
            className="h-[29%] lg:h-auto w-full lg:w-[54%] flex items-center justify-center shrink-0 select-none px-1 lg:px-0"
            style={{ opacity: 0 }}
          >
            <div
              className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] lg:max-w-[700px] h-full flex items-center justify-center"
              style={{
                filter: 'drop-shadow(0 0 70px rgba(229,33,43,0.38)) drop-shadow(0 8px 35px rgba(0,0,0,0.85))',
              }}
            >
              <img
                src="/logo/zanka-logo-withoutbackground.png"
                alt="ZANKA"
                className="max-h-full w-auto max-w-full lg:w-full object-contain mx-auto transition-transform duration-300"
              />
            </div>
          </div>

          {/* 50% SPACE FOR CONTENT on Mobile / 46% Right Column on Desktop */}
          <div
            className="h-[71%] lg:h-auto w-full lg:w-[46%] flex flex-col items-center lg:items-start justify-center text-center lg:text-left shrink-0 px-1 lg:px-0 gap-2.5 xs:gap-3.5 lg:gap-4"
          >

            {/* Eyebrow Badge */}
            <div className="flex items-center gap-1.5 lg:gap-2" style={{ opacity: 0 }} ref={subRef}>
              <div className="hidden lg:block w-10 h-[2px]" style={{ background: 'var(--red)' }} />
              <div className="flex items-center gap-2 px-4 py-1 lg:px-4 lg:py-1 rounded-full bg-[var(--red)]/15 border border-[var(--red)]/35 shadow-[0_0_15px_rgba(229,33,43,0.18)]">
                <span className="w-2 h-2 rounded-full bg-[var(--red)] animate-pulse shadow-[0_0_8px_var(--red)]" />
                <p className="font-body text-xs lg:text-xs font-bold tracking-[0.2em] uppercase text-[var(--red)]">
                  THRIFTED FASHION
                </p>
              </div>
            </div>

            {/* Main Heading */}
            <h1
              ref={headingRef}
              className="font-display text-white tracking-wide font-extrabold text-[1.65rem] xs:text-3xl sm:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl leading-[1.12]"
              style={{ opacity: 0 }}
            >
              HANDPICKED<br className="hidden lg:inline" /> THRIFTED DRESSES
            </h1>

            {/* Description */}
            <div ref={descRef} className="max-w-[340px] xs:max-w-sm sm:max-w-md lg:max-w-lg">
              <p
                className="font-body text-white/95 text-xs xs:text-sm lg:text-base xl:text-lg font-normal leading-relaxed"
                style={{ opacity: 0 }}
              >
                Discover handpicked thrifted dresses from different brands.
                Every piece is carefully selected for the best style and quality.
              </p>
            </div>

            {/* Value Proposition Pills */}
            <div
              ref={propsRef}
              className="flex flex-wrap justify-center lg:justify-start items-center gap-2 lg:gap-2.5 pt-0.5 lg:pt-1 max-w-[360px] xs:max-w-md lg:max-w-none"
            >
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.text}
                  className="font-body tracking-wider uppercase px-3.5 py-1.5 lg:px-4 lg:py-2 font-semibold flex items-center gap-2 leading-normal rounded-full transition-all duration-300 hover:border-[var(--red)]/60 hover:bg-[var(--red)]/15 text-xs lg:text-xs xl:text-sm"
                  style={{
                    opacity: 0,
                    background: 'rgba(229, 33, 43, 0.12)',
                    border: '1px solid rgba(229, 33, 43, 0.35)',
                    color: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span style={{ color: 'var(--red)', fontSize: '1em' }}>{prop.icon}</span>
                  <span>{prop.text}</span>
                </div>
              ))}
            </div>

            {/* Quality Note */}
            <p
              ref={disclaimerRef}
              className="font-body text-white/75 text-xs lg:text-xs tracking-[0.06em] lg:tracking-[0.08em] uppercase font-medium leading-normal lg:leading-relaxed pt-0.5"
              style={{ opacity: 0 }}
            >
              ✦ Pre-loved items — curated with quality
            </p>
          </div>
        </div>

        {/* 10% BUTTON on Mobile / Desktop CTA Container */}
        <div ref={ctaRef} className="h-[10%] lg:h-auto w-full flex items-center justify-center shrink-0 lg:mt-8 z-20">
          <a
            href="#socks"
            className="relative inline-flex items-center justify-center font-display text-sm lg:text-sm tracking-widest uppercase text-white bg-[var(--red)] rounded-full overflow-hidden group transition-all duration-300 hover:shadow-[0_10px_35px_rgba(229,33,43,0.65)] cursor-pointer active:scale-95 shadow-[0_6px_25px_rgba(229,33,43,0.45)] w-[85%] max-w-[280px] lg:w-auto min-h-[48px] xs:min-h-[52px] px-8 py-3 lg:px-8 lg:py-3.5"
          >
            <span className="relative z-10 font-extrabold tracking-wider flex items-center gap-2">
              SHOP NOW
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
                <path d="M4 10h12m-5-5l5 5-5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </a>
        </div>

        {/* 10% BOTTOM BLANK SPACE on Mobile (Holds Tagline) / Desktop Tagline */}
        <div className="h-[10%] lg:h-auto w-full flex items-center justify-center shrink-0 pb-2 lg:pb-0 lg:order-first lg:mb-4">
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
                  fontSize: 'clamp(0.82rem, 2.8vw, 1.05rem)',
                  letterSpacing: '0.24em',
                  opacity: 0,
                  marginRight: char === ' ' ? '0.45em' : undefined,
                }}
              >
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
