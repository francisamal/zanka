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
    camera.position.z = 5

    const count = 1800
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const velocities: number[] = []

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      velocities.push((Math.random() - 0.5) * 0.0025, (Math.random() - 0.5) * 0.0025)
      const isRed = Math.random() > 0.72
      colors[i * 3] = isRed ? 0.9 : 0.9
      colors[i * 3 + 1] = isRed ? 0.13 : 0.9
      colors[i * 3 + 2] = isRed ? 0.17 : 0.9
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.018,
      transparent: true,
      opacity: 0.5,
      vertexColors: true,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    let mouseX = 0, mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.7
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 0.7
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
      for (let i = 0; i < count; i++) {
        pos[i * 3] += velocities[i * 2]
        pos[i * 3 + 1] += velocities[i * 2 + 1]
        if (Math.abs(pos[i * 3]) > 12) velocities[i * 2] *= -1
        if (Math.abs(pos[i * 3 + 1]) > 12) velocities[i * 2 + 1] *= -1
      }
      geo.attributes.position.needsUpdate = true
      particles.rotation.y = elapsed * 0.022 + mouseX * 0.4
      particles.rotation.x = elapsed * 0.01 + mouseY * 0.3
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
