'use client'

import React from 'react'
import Link from 'next/link'
import { AdminTab } from './AdminSidebar'

interface AdminMobileNavProps {
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

export function AdminMobileNav({
  activeTab,
  setActiveTab,
  setViewState,
  counts
}: AdminMobileNavProps) {
  const tabs: { key: AdminTab; label: string; count?: number; icon: React.ReactNode }[] = [
    {
      key: 'products',
      label: 'Products',
      count: counts.products,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      key: 'categories',
      label: 'Categories',
      count: counts.categories,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      key: 'media',
      label: 'Media',
      count: counts.media,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      key: 'orders',
      label: 'Orders',
      count: counts.orders,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    }
  ]

  return (
    <div className="lg:hidden flex flex-col border-b border-white/10 bg-[#070707] shrink-0">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-600/30">
            <span className="font-display text-sm font-black text-white">Z</span>
          </div>
          <div>
            <span className="font-body text-[8px] tracking-[0.3em] uppercase font-bold text-red-500 block leading-none">
              Admin Panel
            </span>
            <h1 className="font-display text-base font-bold tracking-widest text-white leading-tight">
              ZANKA
            </h1>
          </div>
        </div>

        <Link
          href="/"
          className="font-body text-[10px] tracking-widest uppercase border border-white/15 px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1"
        >
          <span>← Shop</span>
        </Link>
      </div>

      {/* Horizontally Scrollable Tabs */}
      <div className="flex overflow-x-auto px-3 py-2 gap-1.5 hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setViewState('list')
              }}
              className={`font-body text-xs tracking-wider uppercase px-3.5 py-2.5 shrink-0 rounded-lg transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
