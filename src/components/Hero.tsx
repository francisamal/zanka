'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

const TAGLINE = 'BEYOND THE USUAL'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const zankaRef = useRef<HTMLHeadingElement>(null)
  const lettersRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

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

    // Columns and rows for a structured dynamic grid mesh
    const columns = 75
    const rows = 45
    const count = columns * rows
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const i = x * rows + y
        // Centered grid arrangement
        positions[i * 3] = (x - columns / 2) * 0.28
        positions[i * 3 + 1] = (y - rows / 2) * 0.24
        positions[i * 3 + 2] = 0

        // Soft white/gray particles mixed with brand red accents
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

    // Programmatically generate a high-quality soft circle texture for particles
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
      size: 0.12,
      map: createCircleTexture(),
      transparent: true,
      opacity: 0.5,
      vertexColors: true,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geo, mat)
    // Tilt the whole grid slightly for depth perspective
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
          
          // Coordinate-based wave propagation
          const xAngle = (x * 0.12) + elapsed * 1.6
          const yAngle = (y * 0.15) + elapsed * 1.3
          
          // Smooth mathematical waving
          let z = Math.sin(xAngle) * 0.45 + Math.cos(yAngle) * 0.35

          // Reactive mouse ripple attraction/repulsion
          const px = pos[i * 3]
          const py = pos[i * 3 + 1]
          
          // Scale mouse position to screen grid coordinates
          const targetX = mouseX * 12
          const targetY = mouseY * 8
          const dist = Math.sqrt((px - targetX) ** 2 + (py - targetY) ** 2)

          if (dist < 5) {
            // Apply cursor deformation ripple
            z += (5 - dist) * 0.35 * Math.sin(elapsed * 5 - dist)
          }

          pos[i * 3 + 2] = z
        }
      }
      geo.attributes.position.needsUpdate = true
      
      // Elegant, ambient drift rotation reacting to mouse coords
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

    if (ctaRef.current) {
      tl.fromTo(ctaRef.current.children,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
        '-=0.5'
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
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(229,33,43,0.06) 0%, rgba(8,8,8,0.7) 55%, rgba(8,8,8,0.96) 100%)' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-10 md:px-16 w-full">

        <div
          ref={zankaRef}
          className="select-none"
          style={{
            opacity: 0,
            width: 'clamp(280px, 55vw, 700px)',
            filter: 'drop-shadow(0 0 60px rgba(229,33,43,0.4)) drop-shadow(0 4px 30px rgba(0,0,0,0.6))',
          }}
        >
          <img
            src="/logo/zanka-logo-withoutbackground.png"
            alt="ZANKA"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        <div
          ref={lettersRef}
          className="overflow-hidden flex flex-wrap justify-center mt-2"
          style={{ perspective: '600px' }}
          aria-label={TAGLINE}
        >
          {TAGLINE.split('').map((char, i) => (
            <span
              key={i}
              className="letter font-display text-white leading-none"
              style={{
                display: 'inline-block',
                fontSize: 'clamp(1.2rem, 4vw, 3.2rem)',
                letterSpacing: '0.18em',
                opacity: 0,
                marginRight: char === ' ' ? '0.55em' : undefined,
              }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </div>

        <p
          ref={subRef}
          className="font-body text-white/35 text-xs tracking-[0.4em] uppercase font-light mt-6"
          style={{ opacity: 0 }}
        >
          Pop culture socks · Statement fashion · Free your fit
        </p>

        <div ref={ctaRef} className="mt-9 flex gap-3 flex-wrap justify-center">
          <a
            href="#socks"
            className="font-body text-xs tracking-[0.3em] uppercase px-8 py-3.5 font-medium transition-all duration-300 hover:opacity-80"
            style={{ background: 'var(--red)', color: '#fff', opacity: 0 }}
          >
            Shop Socks
          </a>
          <a
            href="#tops"
            className="font-body text-xs tracking-[0.3em] uppercase px-8 py-3.5 font-medium border border-white/20 text-white/60 hover:border-white/60 hover:text-white transition-all duration-300"
            style={{ opacity: 0 }}
          >
            Shop Tops
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-body text-[10px] tracking-[0.35em] uppercase text-white/20">Scroll</span>
        <div className="w-px h-12 overflow-hidden" style={{ background: 'rgba(229,33,43,0.15)' }}>
          <div className="w-full h-full" style={{ background: 'linear-gradient(to bottom, var(--red), transparent)', animation: 'scrollLine 2s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  )
}
