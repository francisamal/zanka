'use client'

export default function SiteBorders() {
  return (
    <>
      <div
        className="fixed top-0 left-4 md:left-8 bottom-0 w-px z-30 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(229,33,43,0.4) 20%, rgba(229,33,43,0.2) 80%, transparent 100%)' }}
      />
      <div
        className="fixed top-0 right-4 md:right-8 bottom-0 w-px z-30 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(229,33,43,0.4) 20%, rgba(229,33,43,0.2) 80%, transparent 100%)' }}
      />
      <div
        className="fixed top-0 left-4 md:left-8 right-4 md:right-8 h-px z-30 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(229,33,43,0.4), transparent)' }}
      />
      <div
        className="fixed bottom-0 left-4 md:left-8 right-4 md:right-8 h-px z-30 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(229,33,43,0.3), transparent)' }}
      />
    </>
  )
}
