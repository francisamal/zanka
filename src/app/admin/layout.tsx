'use client'

import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const originalCursor = document.body.style.cursor
    document.body.style.cursor = 'default'

    return () => {
      document.body.style.cursor = originalCursor
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#e5212b] selection:text-white font-body cursor-default">
      {children}
    </div>
  )
}
