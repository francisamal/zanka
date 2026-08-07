'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price_inr: number
  price_usd: number
  image_url: string
  images?: string[]
  tag: string
  category_id: string
  is_sold_out?: boolean
}

interface ProductsTabProps {
  products: Product[]
  categories: Category[]
  viewState: 'list' | 'form'
  setViewState: (view: 'list' | 'form') => void
  editingId: string | null
  // Product Form states & setters
  prodName: string
  setProdName: (v: string) => void
  prodSlug: string
  setProdSlug: (v: string) => void
  prodDesc: string
  setProdDesc: (v: string) => void
  prodPriceInr: string
  setProdPriceInr: (v: string) => void
  prodPriceUsd: string
  setProdPriceUsd: (v: string) => void
  prodTag: string
  setProdTag: (v: string) => void
  prodCategoryId: string
  setProdCategoryId: (v: string) => void
  prodImageUrl: string
  setProdImageUrl: (v: string) => void
  prodImages: string[]
  setProdImages: React.Dispatch<React.SetStateAction<string[]>>
  prodIsSoldOut: boolean
  setProdIsSoldOut: (v: boolean) => void
  // Handlers
  handleNameChange: (val: string, isProduct: boolean) => void
  handleProductSubmit: (e: React.FormEvent) => void
  handleProductDelete: (id: string) => void
  handleEditProduct: (p: Product) => void
  resetProductForm: () => void
  // Image Upload Trigger
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  setShowMediaPickerModal: (show: boolean) => void
}

export function ProductsTab({
  products,
  categories,
  viewState,
  setViewState,
  editingId,
  prodName,
  setProdName,
  prodSlug,
  setProdSlug,
  prodDesc,
  setProdDesc,
  prodPriceInr,
  setProdPriceInr,
  prodPriceUsd,
  setProdPriceUsd,
  prodTag,
  setProdTag,
  prodCategoryId,
  setProdCategoryId,
  prodImageUrl,
  setProdImageUrl,
  prodImages,
  setProdImages,
  prodIsSoldOut,
  setProdIsSoldOut,
  handleNameChange,
  handleProductSubmit,
  handleProductDelete,
  handleEditProduct,
  resetProductForm,
  handleImageUpload,
  fileInputRef,
  setShowMediaPickerModal
}: ProductsTabProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCatFilter, setSelectedCatFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'soldout'>('all')

  const totalProducts = products.length
  const soldOutCount = products.filter((p) => p.is_sold_out).length
  const inStockCount = totalProducts - soldOutCount

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCatFilter === 'all' || p.category_id === selectedCatFilter
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'soldout'
        ? p.is_sold_out
        : !p.is_sold_out
    return matchesSearch && matchesCategory && matchesStock
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {viewState === 'list' ? (
        <>
          {/* Rounded, separated stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <p className="text-xs text-neutral-400">TOTAL PRODUCTS</p>
              <p className="text-2xl font-bold text-white mt-1">{totalProducts}</p>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <p className="text-xs text-neutral-400">IN STOCK</p>
              <p className="text-2xl font-bold text-white mt-1">{inStockCount}</p>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <p className="text-xs text-neutral-400">SOLD OUT</p>
              <p className="text-2xl font-bold text-white mt-1">{soldOutCount}</p>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <p className="text-xs text-neutral-400">ACTIVE CATEGORIES</p>
              <p className="text-2xl font-bold text-white mt-1">{categories.length}</p>
            </div>
          </div>

          {/* Action Header & Search Toolbar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-sm">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-widest text-white uppercase">
                Product Catalog
              </h2>
              <p className="font-body text-xs text-white/50 tracking-wider mt-0.5">
                Manage all footwear, garments & merchandise items ({filteredProducts.length} showing)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-500 transition-all font-body"
                />
              </div>

              {/* Category selector */}
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white/80 focus:outline-none focus:border-red-500 transition-all font-body"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Stock Status Selector */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white/80 focus:outline-none focus:border-red-500 transition-all font-body"
              >
                <option value="all">All Stock</option>
                <option value="instock">In Stock</option>
                <option value="soldout">Sold Out</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 border border-white/10 rounded-2xl bg-[#121212] px-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-white/40 text-lg">
                📦
              </div>
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-2">
                No Products Found
              </h3>
              <p className="font-body text-xs text-white/40 max-w-sm mx-auto mb-6">
                Try adjusting your search criteria or category filter, or add a new product to your inventory.
              </p>
              <button
                onClick={() => {
                  resetProductForm()
                  setViewState('form')
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-body text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all"
              >
                Create Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => {
                const categoryName =
                  categories.find((c) => c.id === p.category_id)?.name || 'Uncategorized'

                let pImgs: string[] = []
                if (p.images) {
                  pImgs = Array.isArray(p.images)
                    ? p.images
                    : typeof p.images === 'string'
                    ? JSON.parse(p.images)
                    : []
                }
                const displayImg = p.image_url || pImgs[0] || ''

                return (
                  <div
                    key={p.id}
                    className="group bg-[#121212] border border-white/10 hover:border-white/25 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/50"
                  >
                    <div>
                      {/* Image Box Locked with aspect-square */}
                      <div className="aspect-square w-full relative overflow-hidden bg-[#0a0a0a] rounded-t-xl">
                        {displayImg ? (
                          <Image
                            src={displayImg}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 font-body text-xs uppercase tracking-widest">
                            No Image
                          </div>
                        )}

                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 max-w-[70%]">
                          {p.is_sold_out && (
                            <span className="bg-red-600/90 backdrop-blur-md text-white font-body text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow-md truncate">
                              Sold Out
                            </span>
                          )}
                          {p.tag && (
                            <span className="bg-black/75 backdrop-blur-md border border-white/20 text-white/90 font-body text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded truncate" title={p.tag}>
                              {p.tag}
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-black/80 backdrop-blur-md border border-white/15 text-white/80 font-body text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md">
                            {categoryName}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5">
                        <h3 className="font-display text-base font-bold text-white tracking-wide truncate mb-1" title={p.name}>
                          {p.name}
                        </h3>
                        <p className="font-mono text-[11px] text-white/40 truncate mb-3">
                          /{p.slug}
                        </p>
                        <p className="font-body text-xs text-white/60 line-clamp-2 leading-relaxed mb-4">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Footer & Prices */}
                    <div className="px-5 pb-5 pt-0 border-t border-white/5 mt-auto">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <span className="font-body text-[10px] text-white/40 uppercase block leading-none mb-1">Price</span>
                          <span className="font-display text-base font-bold text-white">
                            ₹{p.price_inr ? p.price_inr.toLocaleString('en-IN') : '0'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-body text-[10px] text-white/40 uppercase block leading-none mb-1 font-mono">USD</span>
                          <span className="font-mono text-xs font-semibold text-white/80">
                            ${p.price_usd ? Number(p.price_usd).toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="w-full py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-white font-body text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>✏️ Edit</span>
                        </button>
                        <button
                          onClick={() => handleProductDelete(p.id)}
                          className="w-full py-2 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white font-body text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>🗑️ Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        /* FORM VIEW */
        <form onSubmit={handleProductSubmit} className="max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <button
                type="button"
                onClick={() => setViewState('list')}
                className="font-body text-xs text-white/50 hover:text-white tracking-widest uppercase flex items-center gap-1 mb-2 transition-colors"
              >
                ← Back to Catalog
              </button>
              <h2 className="font-display text-2xl font-bold tracking-widest text-white uppercase">
                {editingId ? 'Edit Product' : 'Create New Product'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewState('list')}
                className="px-5 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/10 font-body text-xs font-semibold tracking-wider uppercase transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-body text-xs font-bold tracking-wider uppercase shadow-lg shadow-red-600/30 transition-all"
              >
                {editingId ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Information */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-5">
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
                General Information
              </h3>

              {/* Product Name */}
              <div>
                <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZANKA Cyber Hoodie"
                  value={prodName}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-body"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. zanka-cyber-hoodie"
                  value={prodSlug}
                  onChange={(e) => setProdSlug(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-mono"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors font-body"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag / Badge */}
              <div>
                <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  Tag / Collection Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. NEW RELEASE, LIMITED, Bestseller"
                  value={prodTag}
                  onChange={(e) => setProdTag(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-body"
                />
              </div>

              {/* Sold Out Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-white block">
                    Mark as Sold Out
                  </span>
                  <span className="font-body text-[11px] text-white/40">
                    Product will show as unavailable on storefront
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setProdIsSoldOut(!prodIsSoldOut)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    prodIsSoldOut ? 'bg-red-600' : 'bg-white/15'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      prodIsSoldOut ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right Column: Pricing & Description */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
                  Pricing Configuration
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                      Price (INR ₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="3999"
                      value={prodPriceInr}
                      onChange={(e) => setProdPriceInr(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                      Price (USD $) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="49"
                      value={prodPriceUsd}
                      onChange={(e) => setProdPriceUsd(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
                  Product Description
                </h3>

                <div>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed specifications, material composition, sizing notes..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-body leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card: Product Images & Gallery */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                  Product Media & Gallery
                </h3>
                <p className="font-body text-xs text-white/50 mt-0.5">
                  Upload images or select existing items from your Media Library
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMediaPickerModal(true)}
                  className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-white font-body text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2"
                >
                  <span>🖼️ Media Library</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-body text-xs font-bold tracking-wider uppercase shadow-md transition-all flex items-center gap-2"
                >
                  <span>⬆ Upload File</span>
                </button>
              </div>
            </div>

            {/* Main Featured Image Field */}
            <div>
              <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Main Featured Image URL *
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  required
                  placeholder="https://your-bucket.s3.amazonaws.com/image.jpg"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  className="flex-1 bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Gallery Images List */}
            <div>
              <label className="block font-body text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
                Gallery Images ({prodImages.length})
              </label>

              {prodImages.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/15 rounded-xl bg-white/[0.01]">
                  <p className="font-body text-xs text-white/40">No additional gallery images added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {prodImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-white/15 bg-[#080808]"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => setProdImages(prodImages.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
