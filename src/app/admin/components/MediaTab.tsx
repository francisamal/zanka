'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Category } from './ProductsTab'

export interface MediaItem {
  id: string
  file_name: string
  file_size: number | null
  file_type: string | null
  image_url: string
  category_id: string | null
  created_at: string
}

interface MediaTabProps {
  mediaList: MediaItem[]
  categories: Category[]
  mediaLoading: boolean
  selectedMediaCategory: string
  setSelectedMediaCategory: (catId: string) => void
  mediaSearchQuery: string
  setMediaSearchQuery: (q: string) => void
  bulkUploadCatId: string
  setBulkUploadCatId: (catId: string) => void
  handleBulkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDeleteMedia: (id: string) => void
  bulkFileInputRef: React.RefObject<HTMLInputElement | null>
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

export function MediaTab({
  mediaList,
  categories,
  mediaLoading,
  selectedMediaCategory,
  setSelectedMediaCategory,
  mediaSearchQuery,
  setMediaSearchQuery,
  bulkUploadCatId,
  setBulkUploadCatId,
  handleBulkUpload,
  handleDeleteMedia,
  bulkFileInputRef,
  showToast
}: MediaTabProps) {
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null)

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

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    showToast('Image URL copied to clipboard!', 'success')
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Upload Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-widest text-white uppercase">
            Media Library & Assets
          </h2>
          <p className="font-body text-xs text-white/50 tracking-wider mt-0.5">
            Manage store images, banners & product photography ({mediaList.length} total files)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Target Category for Upload */}
          <select
            value={bulkUploadCatId}
            onChange={(e) => setBulkUploadCatId(e.target.value)}
            className="bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/80 focus:outline-none focus:border-red-500 transition-all font-body"
          >
            <option value="">Upload Category (Optional)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            ref={bulkFileInputRef}
            onChange={handleBulkUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => bulkFileInputRef.current?.click()}
            className="bg-red-600 hover:bg-red-500 text-white font-body text-xs font-bold tracking-wider uppercase px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <span>⬆</span>
            <span>Upload Images</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#121212] border border-white/10 rounded-2xl p-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by filename..."
            value={mediaSearchQuery}
            onChange={(e) => setMediaSearchQuery(e.target.value)}
            className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-500 transition-colors font-body"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto hide-scrollbar py-1">
          <button
            onClick={() => setSelectedMediaCategory('all')}
            className={`px-3.5 py-2 rounded-xl font-body text-xs uppercase tracking-wider transition-all shrink-0 ${
              selectedMediaCategory === 'all'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedMediaCategory('uncategorized')}
            className={`px-3.5 py-2 rounded-xl font-body text-xs uppercase tracking-wider transition-all shrink-0 ${
              selectedMediaCategory === 'uncategorized'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            Uncategorized
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedMediaCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-body text-xs uppercase tracking-wider transition-all shrink-0 ${
                selectedMediaCategory === cat.id
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {mediaLoading ? (
        <div className="text-center py-20 text-white/40 font-body text-xs uppercase tracking-widest">
          Loading Media Library...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-24 border border-white/10 rounded-2xl bg-[#121212] px-4">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-white/40 text-lg">
            🖼️
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-2">
            No Media Files
          </h3>
          <p className="font-body text-xs text-white/40 max-w-sm mx-auto mb-6">
            Upload image assets using the button above to manage them in your store catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((media) => {
            const catName = categories.find((c) => c.id === media.category_id)?.name

            return (
              <div
                key={media.id}
                className="group bg-[#121212] border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                {/* Image Container */}
                <div
                  onClick={() => setPreviewMedia(media)}
                  className="relative aspect-square w-full bg-[#0a0a0a] cursor-pointer overflow-hidden"
                >
                  <Image
                    src={media.image_url}
                    alt={media.file_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />

                  {catName && (
                    <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-md border border-white/15 text-white/80 font-body text-[9px] uppercase px-2 py-0.5 rounded-md">
                      {catName}
                    </span>
                  )}
                </div>

                {/* Footer Info & Actions */}
                <div className="p-3 bg-[#151515] flex flex-col justify-between flex-1">
                  <div>
                    <p className="font-body text-xs font-semibold text-white/90 truncate mb-0.5" title={media.file_name}>
                      {media.file_name}
                    </p>
                    <p className="font-mono text-[10px] text-white/40">
                      {formatFileSize(media.file_size)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    <button
                      onClick={() => copyToClipboard(media.image_url)}
                      className="py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 font-body text-[10px] font-bold uppercase transition-all"
                      title="Copy URL"
                    >
                      🔗 Copy
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(media.id)}
                      className="py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white font-body text-[10px] font-bold uppercase transition-all"
                      title="Delete Image"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Media Zoom Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl border border-white/15 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all text-sm"
            >
              ✕
            </button>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
              <Image
                src={previewMedia.image_url}
                alt={previewMedia.file_name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="font-display text-base font-bold text-white truncate">
                {previewMedia.file_name}
              </h4>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-white/50">
                <span>Size: {formatFileSize(previewMedia.file_size)}</span>
                <span>Uploaded: {new Date(previewMedia.created_at).toLocaleDateString()}</span>
              </div>
              <div className="pt-2">
                <input
                  type="text"
                  readOnly
                  value={previewMedia.image_url}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 font-mono select-all focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
