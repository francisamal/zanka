'use client'

import React from 'react'
import Link from 'next/link'

export type AdminTab = 'products' | 'categories' | 'media' | 'orders' | 'settings'

interface AdminSidebarProps {
  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void
  setViewState: (view: 'list' | 'form') => void
  counts: {
    products: number
    categories: number
    media: number
    orders: number
  }
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  setViewState,
  counts
}: AdminSidebarProps) {
  const navItems: { key: AdminTab; label: string; count?: number; icon: React.ReactNode }[] = [
    {
      key: 'products',
      label: 'Products',
      count: counts.products,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      key: 'categories',
      label: 'Categories',
      count: counts.categories,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      key: 'media',
      label: 'Media Library',
      count: counts.media,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      key: 'orders',
      label: 'Orders',
      count: counts.orders,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      key: 'settings',
      label: 'Settings & Logs',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col justify-between border-r border-white/10 bg-[#0d0d0d] p-6 shrink-0 h-screen sticky top-0 select-none">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="px-2 pt-1 flex items-center gap-3.5">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/25 border border-red-400/30">
            <span className="font-display text-lg font-black text-white tracking-wider">Z</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-widest text-white leading-none mb-1">
              ZANKA
            </h1>
            <span className="font-body text-[9px] tracking-[0.25em] uppercase font-semibold text-white/40 block leading-none">
              ADMIN CONSOLE
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1.5">
          <span className="px-3 font-body text-[10px] uppercase tracking-[0.2em] font-semibold text-white/30 mb-1">
            Menu
          </span>
          {navItems.map((item) => {
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key)
                  setViewState('list')
                }}
                className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 text-left font-body text-xs font-semibold tracking-wider uppercase ${
                  isActive
                    ? 'bg-[#e5212b] text-white shadow-md shadow-red-600/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-normal transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/50 group-hover:bg-white/15 group-hover:text-white/80'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Return to Store Link */}
      <div className="pt-4 border-t border-white/10">
        <Link
          href="/"
          className="group flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 text-xs font-body tracking-wider uppercase font-semibold"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Store
          </span>
          <span className="text-[10px] text-white/30 group-hover:text-white/60 font-mono">↗</span>
        </Link>
      </div>
    </aside>
  )
}
