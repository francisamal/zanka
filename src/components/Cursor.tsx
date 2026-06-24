'use client'

import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = mouseX + 'px'
      dot.style.top = mouseY + 'px'
    }

    const onEnter = () => {
      ring.style.transform = 'translate(-50%, -50%) scale(2.5)'
      ring.style.borderColor = 'var(--red)'
      dot.style.opacity = '0'
    }
    const onLeave = () => {
      ring.style.transform = 'translate(-50%, -50%) scale(1)'
      ring.style.borderColor = 'rgba(229,33,43,0.5)'
      dot.style.opacity = '1'
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.1
      ringY += (mouseY - ringY) * 0.1
      ring.style.left = ringX + 'px'
      ring.style.top = ringY + 'px'
      requestAnimationFrame(animate)
    }

    let isHovering = false
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = !!(target && target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer'))
      if (isInteractive && !isHovering) {
        isHovering = true
        onEnter()
      } else if (!isInteractive && isHovering) {
        isHovering = false
        onLeave()
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onMouseOver)
    requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onMouseOver)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="fixed w-2 h-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" style={{ background: 'var(--red)' }} />
      <div ref={ringRef} className="fixed w-8 h-8 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300" style={{ border: '1px solid rgba(229,33,43,0.5)' }} />
    </>
  )
}
