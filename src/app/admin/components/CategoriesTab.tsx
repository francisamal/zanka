'use client'

import React from 'react'
import { Category, Product } from './ProductsTab'

interface CategoriesTabProps {
  categories: Category[]
  products: Product[]
  catName: string
  setCatName: (v: string) => void
  catSlug: string
  setCatSlug: (v: string) => void
  handleNameChange: (val: string, isProduct: boolean) => void
  handleCategorySubmit: (e: React.FormEvent) => void
  handleCategoryDelete: (id: string) => void
}

export function CategoriesTab({
  categories,
  products,
  catName,
  catSlug,
  setCatSlug,
  handleNameChange,
  handleCategorySubmit,
  handleCategoryDelete
}: CategoriesTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-widest text-white uppercase">
            Category Management
          </h2>
          <p className="font-body text-xs text-white/50 tracking-wider mt-0.5">
            Organize products into structured store taxonomy ({categories.length} active categories)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Create Category Card */}
        <form
          onSubmit={handleCategorySubmit}
          className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-5 shadow-lg"
        >
          <h3 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
            Add New Category
          </h3>

          <div>
            <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hoodies, Tees, Accessories"
              value={catName}
              onChange={(e) => handleNameChange(e.target.value, false)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-body"
            />
          </div>

          <div>
            <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. hoodies"
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-body text-xs font-bold tracking-wider uppercase shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>Create Category</span>
          </button>
        </form>

        {/* Right Column: Category List Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#121212] px-4">
              <p className="font-body text-xs text-white/40 tracking-wider uppercase">
                No categories created yet. Create your first category on the left.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const productCount = products.filter((p) => p.category_id === cat.id).length

                return (
                  <div
                    key={cat.id}
                    className="group bg-[#121212] border border-white/10 hover:border-white/25 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-red-400 bg-red-950/30 border border-red-500/20 px-2.5 py-0.5 rounded-md">
                          /{cat.slug}
                        </span>
                        <span className="font-body text-[11px] font-semibold text-white/40">
                          {productCount} {productCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>

                      <h4 className="font-display text-lg font-bold text-white tracking-wide">
                        {cat.name}
                      </h4>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                      <span className="font-body text-[10px] text-white/30 tracking-wider uppercase font-mono">
                        ID: {cat.id.slice(0, 8)}...
                      </span>

                      <button
                        onClick={() => handleCategoryDelete(cat.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white font-body text-xs font-semibold uppercase transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
