'use client'

import React from 'react'
import Image from 'next/image'

interface MediaItem {
  id: string
  file_name: string
  file_size: number | null
  file_type: string | null
  image_url: string
  category_id: string | null
  created_at: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  mediaList: MediaItem[]
  categories: Category[]
  selectedMediaCategory: string
  setSelectedMediaCategory: (catId: string) => void
  mediaSearchQuery: string
  setMediaSearchQuery: (query: string) => void
  selectedMediaForProduct: string[]
  setSelectedMediaForProduct: React.Dispatch<React.SetStateAction<string[]>>
  onConfirmSelection: (urls: string[]) => void
}

export function MediaPickerModal({
  isOpen,
  onClose,
  mediaList,
  categories,
  selectedMediaCategory,
  setSelectedMediaCategory,
  mediaSearchQuery,
  setMediaSearchQuery,
  selectedMediaForProduct,
  setSelectedMediaForProduct,
  onConfirmSelection
}: MediaPickerModalProps) {
  if (!isOpen) return null

  const filteredMedia = mediaList.filter((item) => {
    const matchesCategory =
      selectedMediaCategory === 'all'
        ? true
        : selectedMediaCategory === 'uncategorized'
        ? !item.category_id
        : item.category_id === selectedMediaCategory
    const matchesSearch = item.file_name.toLowerCase().includes(mediaSearchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleSelect = (url: string) => {
    setSelectedMediaForProduct((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    )
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]">
          <div>
            <h3 className="font-display text-xl font-bold tracking-widest text-white uppercase">
              Select Images from Media Library
            </h3>
            <p className="font-body text-xs text-white/50 tracking-wider mt-0.5">
              Click images to add them to your product gallery ({selectedMediaForProduct.length} selected)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all flex items-center justify-center text-lg"
          >
            ✕
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0d0d0d] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search filename..."
              value={mediaSearchQuery}
              onChange={(e) => setMediaSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-500 transition-colors font-body"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto hide-scrollbar py-1">
            <button
              onClick={() => setSelectedMediaCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-body text-xs uppercase tracking-wider transition-all shrink-0 ${
                selectedMediaCategory === 'all'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedMediaCategory('uncategorized')}
              className={`px-3 py-1.5 rounded-lg font-body text-xs uppercase tracking-wider transition-all shrink-0 ${
                selectedMediaCategory === 'uncategorized'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              Uncategorized
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedMediaCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-body text-xs uppercase tracking-wider transition-all shrink-0 ${
                  selectedMediaCategory === cat.id
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-20 text-white/40 font-body text-xs tracking-wider">
              No media items found. Upload images to your media library first.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((media) => {
                const isSelected = selectedMediaForProduct.includes(media.image_url)
                return (
                  <div
                    key={media.id}
                    onClick={() => toggleSelect(media.image_url)}
                    className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-red-500 shadow-lg shadow-red-600/30 scale-[0.98]'
                        : 'border-white/10 hover:border-white/40 hover:scale-[1.02]'
                    }`}
                  >
                    <Image
                      src={media.image_url}
                      alt={media.file_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Selection Indicator Overlay */}
                    <div
                      className={`absolute inset-0 transition-opacity flex items-center justify-center ${
                        isSelected ? 'bg-red-950/40 backdrop-blur-[1px]' : 'bg-black/40 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-transform ${
                          isSelected ? 'bg-red-600 text-white scale-110' : 'bg-white/20 text-white border border-white/30'
                        }`}
                      >
                        {isSelected ? '✓' : '+'}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] font-body text-white/80 truncate">
                      {media.file_name}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0a0a0a] flex items-center justify-between">
          <button
            onClick={() => setSelectedMediaForProduct([])}
            className="font-body text-xs text-white/50 hover:text-white underline tracking-wider"
          >
            Clear Selection
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/10 text-xs font-body tracking-wider uppercase font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirmSelection(selectedMediaForProduct)
                onClose()
              }}
              disabled={selectedMediaForProduct.length === 0}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white text-xs font-body tracking-wider uppercase font-bold shadow-lg shadow-red-600/30 transition-all"
            >
              Add Selected ({selectedMediaForProduct.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
