'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price_inr: number
  price_usd: number
  image_url: string
  tag: string
  category_id: string
}

interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'settings'>('products')
  const [viewState, setViewState] = useState<'list' | 'form'>('list')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Toast notification state
  const [toast, setToast] = useState<Toast | null>(null)

  // Category Form State
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')

  // Product Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [prodName, setProdName] = useState('')
  const [prodSlug, setProdSlug] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPriceInr, setProdPriceInr] = useState('')
  const [prodPriceUsd, setProdPriceUsd] = useState('')
  const [prodTag, setProdTag] = useState('')
  const [prodCategoryId, setProdCategoryId] = useState('')
  const [prodImageUrl, setProdImageUrl] = useState('')

  // Upload State
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        setCategories(data.categories || [])
        setProducts(data.products || [])
      } else {
        showToast(data.error || 'Failed to fetch data', 'error')
      }
    } catch (err) {
      showToast('Error loading data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto slug generators
  const handleNameChange = (nameVal: string, isProduct: boolean) => {
    if (isProduct) {
      setProdName(nameVal)
      if (!editingId) {
        setProdSlug(nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
      }
    } else {
      setCatName(nameVal)
      setCatSlug(nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      showToast('Uploading image to Supabase Storage...', 'info')
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setProdImageUrl(data.url)
        showToast('Image uploaded successfully!', 'success')
      } else {
        showToast(data.error || 'Upload failed', 'error')
      }
    } catch (err) {
      showToast('Error uploading image', 'error')
    } finally {
      setUploading(false)
    }
  }

  // Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName || !catSlug) {
      showToast('Category name and slug are required', 'error')
      return
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, slug: catSlug }),
      })
      const data = await res.json()
      if (res.ok) {
        setCategories([...categories, data])
        setCatName('')
        setCatSlug('')
        showToast('Category created successfully!', 'success')
        setViewState('list')
      } else {
        showToast(data.error || 'Failed to create category', 'error')
      }
    } catch (err) {
      showToast('Error creating category', 'error')
    }
  }

  // Category Delete
  const handleCategoryDelete = async (id: string) => {
    if (!confirm('Are you sure? Products in this category will have their category removed.')) return

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id))
        showToast('Category deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete category', 'error')
      }
    } catch (err) {
      showToast('Error deleting category', 'error')
    }
  }

  // Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodName || !prodSlug || !prodPriceInr || !prodImageUrl) {
      showToast('Name, slug, price, and image are required', 'error')
      return
    }

    const payload = {
      id: editingId,
      name: prodName,
      slug: prodSlug,
      description: prodDesc,
      price_inr: parseFloat(prodPriceInr),
      price_usd: parseFloat(prodPriceInr) / 83, // Auto-calculated
      image_url: prodImageUrl,
      tag: prodTag,
      category_id: prodCategoryId || null,
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        if (editingId) {
          setProducts(products.map(p => p.id === editingId ? data : p))
          showToast('Product updated successfully!', 'success')
        } else {
          setProducts([data, ...products])
          showToast('Product created successfully!', 'success')
        }
        resetProductForm()
        setViewState('list')
      } else {
        showToast(data.error || 'Failed to save product', 'error')
      }
    } catch (err) {
      showToast('Error saving product', 'error')
    }
  }

  // Product Delete
  const handleProductDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
        showToast('Product deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete product', 'error')
      }
    } catch (err) {
      showToast('Error deleting product', 'error')
    }
  }

  const editProduct = (product: Product) => {
    setEditingId(product.id)
    setProdName(product.name)
    setProdSlug(product.slug)
    setProdDesc(product.description || '')
    setProdPriceInr(product.price_inr.toString())
    setProdPriceUsd(product.price_usd.toString())
    setProdTag(product.tag || '')
    setProdCategoryId(product.category_id || '')
    setProdImageUrl(product.image_url)
    setViewState('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetProductForm = () => {
    setEditingId(null)
    setProdName('')
    setProdSlug('')
    setProdDesc('')
    setProdPriceInr('')
    setProdPriceUsd('')
    setProdTag('')
    setProdCategoryId('')
    setProdImageUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="h-screen w-full bg-[#030303] p-4 md:p-6 lg:p-8 xl:p-10 flex overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 bg-[#0c0c0c] border border-white/10 rounded-[24px] overflow-hidden shadow-[0_0_80px_-10px_rgba(229,33,43,0.2)] relative h-full">
      {/* Toast Overlay */}
      {toast && (
        <div 
          className="fixed bottom-5 right-5 z-50 px-6 py-4 rounded shadow-2xl border transition-all duration-300 font-body text-xs tracking-wider uppercase flex items-center gap-3"
          style={{
            background: toast.type === 'error' ? 'rgba(229, 33, 43, 0.95)' : 'rgba(8, 8, 8, 0.95)',
            borderColor: toast.type === 'error' ? '#e5212b' : toast.type === 'success' ? '#10B981' : 'rgba(255,255,255,0.2)',
            color: '#fff'
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: toast.type === 'error' ? '#fff' : toast.type === 'success' ? '#10B981' : '#3B82F6' }} />
          {toast.message}
        </div>
      )}

      {/* Mobile Header (Hidden on md) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <span className="font-body text-[8px] tracking-[0.4em] uppercase font-light text-red-500 block">Control Panel</span>
          <h1 className="font-display text-xl tracking-widest text-white">ZANKA ADMIN</h1>
        </div>
        <Link href="/" className="font-body text-[10px] tracking-widest uppercase border border-white/20 px-3 py-2 text-white/60">Shop</Link>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto border-b border-white/10 p-2 gap-2 hide-scrollbar">
         {['products', 'categories', 'orders', 'settings'].map(tab => (
           <button
             key={tab}
             onClick={() => { setActiveTab(tab as any); setViewState('list'); }}
             className={`font-body text-[10px] tracking-[0.2em] uppercase px-4 py-3 shrink-0 transition-colors ${
               activeTab === tab ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/10 p-6 xl:p-8 flex-col gap-10 shrink-0 h-full overflow-y-auto bg-[#070707] z-10 custom-scrollbar">
        <div>
          <span className="font-body text-[10px] tracking-[0.4em] uppercase font-light text-red-500 block mb-1">
            Control Panel
          </span>
          <h1 className="font-display text-3xl tracking-widest text-white">
            ZANKA
          </h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {/* Products */}
          <button
            onClick={() => { setActiveTab('products'); setViewState('list'); }}
            className={`flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase px-4 py-4 transition-all duration-300 text-left ${
              activeTab === 'products' ? 'bg-red-600 text-white font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            🧦 Products
          </button>
          
          {/* Categories */}
          <button
            onClick={() => { setActiveTab('categories'); setViewState('list'); }}
            className={`flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase px-4 py-4 transition-all duration-300 text-left ${
              activeTab === 'categories' ? 'bg-red-600 text-white font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            📂 Categories
          </button>

          {/* Orders (Placeholder) */}
          <button
            onClick={() => { setActiveTab('orders'); setViewState('list'); }}
            className={`flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase px-4 py-4 transition-all duration-300 text-left ${
              activeTab === 'orders' ? 'bg-red-600 text-white font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            📦 Orders
          </button>

          {/* Settings (Placeholder) */}
          <button
            onClick={() => { setActiveTab('settings'); setViewState('list'); }}
            className={`flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase px-4 py-4 transition-all duration-300 text-left ${
              activeTab === 'settings' ? 'bg-red-600 text-white font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚙️ Settings
          </button>
        </nav>

        <Link 
          href="/"
          className="font-body text-xs tracking-[0.2em] uppercase px-5 py-4 border border-white/20 text-white/60 hover:text-white hover:border-white transition-all duration-300 text-center block"
        >
          ← View Shop
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 md:p-12 lg:p-16 overflow-y-auto overflow-x-hidden bg-[#0c0c0c] h-full custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-xs tracking-[0.3em] uppercase text-white/40">Loading Store Data...</p>
          </div>
        ) : (
          <>
            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="animate-in fade-in duration-500">
                {viewState === 'list' ? (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                      <div>
                        <h2 className="font-display text-3xl md:text-4xl tracking-widest text-white uppercase mb-2">Product Catalog</h2>
                        <p className="font-body text-xs text-white/50 tracking-wider">Manage your store inventory ({products.length} total)</p>
                      </div>
                      <button
                        onClick={() => { resetProductForm(); setViewState('form'); }}
                        className="bg-red-600 hover:bg-red-700 font-body text-sm md:text-base tracking-[0.15em] uppercase font-bold py-4 px-8 text-white transition-all shadow-lg hover:shadow-red-500/20 rounded-sm"
                      >
                        + Add New Product
                      </button>
                    </div>

                    {products.length === 0 ? (
                      <div className="text-center py-32 border border-white/10 bg-white/[0.02]">
                        <p className="font-body text-xs tracking-[0.25em] uppercase text-white/40 mb-4">No Products in the database.</p>
                        <button
                          onClick={() => { resetProductForm(); setViewState('form'); }}
                          className="font-body text-[10px] tracking-wider uppercase text-red-500 hover:text-white underline decoration-red-500/30 underline-offset-4"
                        >
                          Create your first product
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(p => {
                          const categoryName = categories.find(c => c.id === p.category_id)?.name || 'Uncategorized'
                          return (
                            <div key={p.id} className="border border-white/10 bg-white/[0.02] group relative flex flex-col justify-between overflow-hidden">
                              <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
                                <Image 
                                  src={p.image_url} 
                                  alt={p.name} 
                                  fill 
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  sizes="(max-width: 768px) 100vw, 30vw"
                                />
                                <div className="absolute top-3 left-3">
                                  <span className="bg-red-600 text-white font-body text-[9px] tracking-widest uppercase px-2 py-1 font-semibold shadow-xl">
                                    {p.tag || 'No Tag'}
                                  </span>
                                </div>
                                {/* Hover overlay for actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                  <button
                                    onClick={() => editProduct(p)}
                                    className="bg-white text-black font-body text-[10px] tracking-wider uppercase font-bold px-4 py-2 hover:bg-red-600 hover:text-white transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleProductDelete(p.id)}
                                    className="bg-red-600 text-white font-body text-[10px] tracking-wider uppercase font-bold px-4 py-2 hover:bg-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                  <p className="font-body text-[9px] tracking-[0.2em] text-white/40 uppercase mb-1">{categoryName}</p>
                                  <h3 className="font-body text-sm font-semibold text-white mb-2 line-clamp-1">{p.name}</h3>
                                  <p className="font-body text-xs text-white/50 line-clamp-2 font-light mb-4 h-8 leading-normal">{p.description || 'No description provided.'}</p>
                                </div>
                                <div className="flex items-end justify-between pt-4 border-t border-white/5">
                                  <div>
                                    <span className="font-body text-sm font-bold text-red-500">₹{p.price_inr}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <button
                      onClick={() => { resetProductForm(); setViewState('list'); }}
                      className="font-body text-xs tracking-[0.2em] uppercase text-white/50 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                    >
                      ← Back to Products
                    </button>
                    
                    <div className="bg-white/[0.02] border border-white/10 p-6 md:p-10 shadow-2xl">
                      <h2 className="font-display text-3xl tracking-widest text-white mb-8 uppercase border-b border-white/10 pb-4">
                        {editingId ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      
                      <form onSubmit={handleProductSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column - Image Upload */}
                          <div>
                            <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-3">Product Image</label>
                            <div className="flex flex-col gap-4">
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              
                              {prodImageUrl ? (
                                <div className="relative border border-white/10 aspect-[3/4] w-full overflow-hidden bg-black/40 group">
                                  <Image 
                                    src={prodImageUrl} 
                                    alt="Product Preview" 
                                    fill 
                                    className="object-contain" 
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                    <button 
                                      type="button" 
                                      onClick={() => fileInputRef.current?.click()}
                                      className="mb-2 bg-white text-black font-body text-[10px] tracking-wider uppercase px-4 py-2 hover:bg-gray-200"
                                    >
                                      Change Image
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => setProdImageUrl('')}
                                      className="bg-red-600 text-white font-body text-[10px] tracking-wider uppercase px-4 py-2 hover:bg-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={uploading}
                                  onClick={() => fileInputRef.current?.click()}
                                  className="w-full aspect-[3/4] bg-white/5 border-2 border-dashed border-white/20 hover:border-red-500 transition-colors flex flex-col items-center justify-center focus:outline-none"
                                >
                                  {uploading ? (
                                    <>
                                      <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
                                      <span className="font-body text-[10px] tracking-wider uppercase text-red-500 animate-pulse">Uploading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-3xl mb-2 text-white/20">+</span>
                                      <span className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40">Upload Photo</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Right Column - Details */}
                          <div className="space-y-6">
                            <div>
                              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Product Name</label>
                              <input 
                                type="text" 
                                value={prodName}
                                onChange={(e) => handleNameChange(e.target.value, true)}
                                className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="e.g. Vintage Anime Tee"
                              />
                            </div>

                            <div>
                              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Slug (URL identifier)</label>
                              <input 
                                type="text" 
                                value={prodSlug}
                                onChange={(e) => setProdSlug(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="e.g. vintage-anime-tee"
                              />
                            </div>

                            <div>
                              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Price (INR)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-3 font-body text-sm text-white/40">₹</span>
                                <input 
                                  type="number" 
                                  step="1"
                                  value={prodPriceInr}
                                  onChange={(e) => setProdPriceInr(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 pl-8 pr-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Tag / Brand</label>
                                <input 
                                  type="text" 
                                  value={prodTag}
                                  onChange={(e) => setProdTag(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                  placeholder="e.g. Evangelion"
                                />
                              </div>
                              <div>
                                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Category</label>
                                <select 
                                  value={prodCategoryId}
                                  onChange={(e) => setProdCategoryId(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                                >
                                  <option value="" className="bg-[#0c0c0c]">Select Category</option>
                                  {categories.map(c => (
                                    <option key={c.id} value={c.id} className="bg-[#0c0c0c]">{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Description</label>
                              <textarea 
                                value={prodDesc}
                                onChange={(e) => setProdDesc(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors h-32 resize-none"
                                placeholder="Describe the product details, condition, sizing, etc."
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-white/10">
                          <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 font-body text-xs tracking-[0.25em] uppercase font-bold py-4 px-10 text-white transition-colors"
                          >
                            {editingId ? 'Save Changes' : 'Create Product'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { resetProductForm(); setViewState('list'); }}
                            className="bg-transparent border border-white/20 hover:border-white font-body text-xs tracking-[0.25em] uppercase font-bold py-4 px-10 text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="animate-in fade-in duration-500 max-w-5xl">
                {viewState === 'list' ? (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                      <div>
                        <h2 className="font-display text-3xl md:text-4xl tracking-widest text-white uppercase mb-2">Categories</h2>
                        <p className="font-body text-xs text-white/50 tracking-wider">Organize your store sections</p>
                      </div>
                      <button
                        onClick={() => { setCatName(''); setCatSlug(''); setViewState('form'); }}
                        className="bg-red-600 hover:bg-red-700 font-body text-sm md:text-base tracking-[0.15em] uppercase font-bold py-4 px-8 text-white transition-all shadow-lg hover:shadow-red-500/20 rounded-sm"
                      >
                        + Add Category
                      </button>
                    </div>

                    {categories.length === 0 ? (
                      <div className="text-center py-32 border border-white/10 bg-white/[0.02]">
                        <p className="font-body text-xs tracking-[0.25em] uppercase text-white/40 mb-4">No categories found.</p>
                      </div>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/10 overflow-x-auto">
                        <table className="w-full text-left font-body">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="py-5 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Category Info</th>
                              <th className="py-5 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Slug</th>
                              <th className="py-5 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categories.map(c => {
                              const count = products.filter(p => p.category_id === c.id).length
                              return (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                  <td className="py-5 px-6">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm text-white font-semibold">{c.name}</span>
                                      <span className="bg-white/10 text-white/60 font-body text-[9px] tracking-wide px-2 py-0.5 rounded-full">
                                        {count} items
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-5 px-6 text-sm text-white/50">
                                    /{c.slug}
                                  </td>
                                  <td className="py-5 px-6 text-right">
                                    <button
                                      onClick={() => handleCategoryDelete(c.id)}
                                      className="font-body text-[10px] tracking-[0.1em] uppercase text-red-500 hover:text-white hover:bg-red-600 border border-red-500/20 px-3 py-1.5 transition-all duration-300 opacity-50 group-hover:opacity-100"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="max-w-2xl">
                    <button
                      onClick={() => setViewState('list')}
                      className="font-body text-xs tracking-[0.2em] uppercase text-white/50 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                    >
                      ← Back to Categories
                    </button>
                    
                    <div className="bg-white/[0.02] border border-white/10 p-6 md:p-10 shadow-2xl">
                      <h2 className="font-display text-2xl tracking-widest text-white mb-8 uppercase border-b border-white/10 pb-4">
                        Add New Category
                      </h2>
                      
                      <form onSubmit={handleCategorySubmit} className="space-y-6">
                        <div>
                          <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Category Name</label>
                          <input 
                            type="text" 
                            value={catName}
                            onChange={(e) => handleNameChange(e.target.value, false)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-4 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="e.g. Outerwear"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Slug (URL identifier)</label>
                          <input 
                            type="text" 
                            value={catSlug}
                            onChange={(e) => setCatSlug(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-4 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="e.g. outerwear"
                          />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/10">
                          <button
                            type="submit"
                            className="flex-1 bg-red-600 hover:bg-red-700 font-body text-xs tracking-[0.25em] uppercase font-bold py-4 text-white transition-colors"
                          >
                            Create Category
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewState('list')}
                            className="bg-transparent border border-white/20 hover:border-white font-body text-xs tracking-[0.25em] uppercase font-bold py-4 px-10 text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PLACEHOLDER TABS */}
            {(activeTab === 'orders' || activeTab === 'settings') && (
              <div className="animate-in fade-in duration-500 max-w-3xl">
                <div className="mb-8">
                  <h2 className="font-display text-3xl md:text-4xl tracking-widest text-white uppercase mb-2">
                    {activeTab === 'orders' ? 'Orders' : 'Settings'}
                  </h2>
                  <p className="font-body text-xs text-white/50 tracking-wider">Module coming soon</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 border-dashed p-16 text-center">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-white/40 mb-2">
                    Under Construction
                  </p>
                  <p className="font-body text-sm text-white/60">
                    This section will be built in the next iteration.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      </div>
    </div>
  )
}
