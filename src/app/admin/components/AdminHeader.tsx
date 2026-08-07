'use client'

import React from 'react'
import { AdminTab } from './AdminSidebar'

interface AdminHeaderProps {
  activeTab: AdminTab
  viewState: 'list' | 'form'
  setViewState: (view: 'list' | 'form') => void
  resetProductForm: () => void
}

export function AdminHeader({
  activeTab,
  viewState,
  setViewState,
  resetProductForm
}: AdminHeaderProps) {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'products':
        return viewState === 'form' ? 'Admin / Products / Editor' : 'Admin / Products'
      case 'categories':
        return 'Admin / Categories'
      case 'media':
        return 'Admin / Media Library'
      case 'orders':
        return 'Admin / Orders'
      case 'settings':
        return 'Admin / Settings & Logs'
      default:
        return 'Admin'
    }
  }

  return (
    <header className="flex items-center justify-between pb-6 mb-8 border-b border-white/10 select-none">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-red-500 font-semibold tracking-wider">
          {getBreadcrumb()}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {activeTab === 'products' && viewState === 'list' && (
          <button
            onClick={() => {
              resetProductForm()
              setViewState('form')
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-body text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Product</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-body text-[11px] font-semibold text-white/70 tracking-wider uppercase">
            Live Storefront
          </span>
        </div>
      </div>
    </header>
  )
}
