'use client'

import React from 'react'

export interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
}

interface AdminToastProps {
  toast: Toast | null
}

export function AdminToast({ toast }: AdminToastProps) {
  if (!toast) return null

  const isError = toast.type === 'error'
  const isSuccess = toast.type === 'success'

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] max-w-md px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3.5 font-body text-xs tracking-wide"
      style={{
        background: isError ? 'rgba(20, 6, 8, 0.95)' : isSuccess ? 'rgba(6, 20, 14, 0.95)' : 'rgba(12, 12, 12, 0.95)',
        borderColor: isError ? 'rgba(229, 33, 43, 0.5)' : isSuccess ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.15)',
        color: '#ffffff',
        boxShadow: isError
          ? '0 10px 30px -10px rgba(229, 33, 43, 0.3)'
          : isSuccess
          ? '0 10px 30px -10px rgba(16, 185, 129, 0.25)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
        style={{
          backgroundColor: isError ? '#e5212b' : isSuccess ? '#10B981' : '#3B82F6'
        }}
      />
      <p className="flex-1 font-medium text-white/90 text-xs leading-relaxed">{toast.message}</p>
    </div>
  )
}
