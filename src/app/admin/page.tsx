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
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
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
      // Only set slug if we are not editing
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

  // Product Submit (Add / Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodName || !prodSlug || !prodPriceInr || !prodPriceUsd || !prodImageUrl) {
      showToast('Name, slug, price, and image are required', 'error')
      return
    }

    const payload = {
      id: editingId,
      name: prodName,
      slug: prodSlug,
      description: prodDesc,
      price_inr: parseFloat(prodPriceInr),
      price_usd: parseFloat(prodPriceUsd),
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between border-b border-white/10 pb-8 mb-12 gap-4">
        <div>
          <span className="font-body text-[10px] tracking-[0.4em] uppercase font-light text-red-500 block mb-1">
            Control Panel
          </span>
          <h1 className="font-display text-4xl sm:text-5xl tracking-widest text-white">
            ZANKA ADMIN
          </h1>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/"
            className="font-body text-xs tracking-[0.2em] uppercase px-5 py-3 border border-white/20 text-white/60 hover:text-white hover:border-white transition-all duration-300"
          >
            ← View Shop
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 gap-2 p-1 bg-white/5 w-fit" style={{ borderRadius: 2 }}>
        <button
          onClick={() => setActiveTab('products')}
          className="font-body text-xs tracking-[0.2em] uppercase px-6 py-3 font-semibold transition-all duration-300"
          style={{
            background: activeTab === 'products' ? 'var(--red)' : 'transparent',
            color: activeTab === 'products' ? '#fff' : 'rgba(255,255,255,0.5)'
          }}
        >
          🧦 Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className="font-body text-xs tracking-[0.2em] uppercase px-6 py-3 font-semibold transition-all duration-300"
          style={{
            background: activeTab === 'categories' ? 'var(--red)' : 'transparent',
            color: activeTab === 'categories' ? '#fff' : 'rgba(255,255,255,0.5)'
          }}
        >
          📂 Categories ({categories.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-xs tracking-[0.3em] uppercase text-white/40">Loading Store Data...</p>
        </div>
      ) : activeTab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Product Form */}
          <div className="lg:col-span-4 bg-white/[0.02] border border-white/10 p-6 md:p-8">
            <h2 className="font-display text-2xl tracking-widest text-white mb-6 uppercase">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleProductSubmit} className="space-y-5">
              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Product Name</label>
                <input 
                  type="text" 
                  value={prodName}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. Pikachu Socks"
                />
              </div>

              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Slug (URL identifier)</label>
                <input 
                  type="text" 
                  value={prodSlug}
                  onChange={(e) => setProdSlug(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. pikachu-socks"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Price (INR)</label>
                  <input 
                    type="number" 
                    step="1"
                    value={prodPriceInr}
                    onChange={(e) => setProdPriceInr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="e.g. 249"
                  />
                </div>
                <div>
                  <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Price (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={prodPriceUsd}
                    onChange={(e) => setProdPriceUsd(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="e.g. 8.99"
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
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="e.g. Pokémon"
                  />
                </div>
                <div>
                  <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Category</label>
                  <select 
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="" className="bg-[#080808]">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#080808]">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Description</label>
                <textarea 
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors h-24 resize-none"
                  placeholder="Describe the product..."
                />
              </div>

              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Product Image</label>
                <div className="flex flex-col gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white/5 border-2 border-dashed border-white/20 hover:border-red-500 transition-colors py-6 text-center focus:outline-none"
                  >
                    {uploading ? (
                      <span className="font-body text-xs tracking-wider uppercase text-red-500 animate-pulse">Uploading file...</span>
                    ) : (
                      <span className="font-body text-xs tracking-wider uppercase text-white/60">Choose Product Photo</span>
                    )}
                  </button>

                  {prodImageUrl && (
                    <div className="relative border border-white/10 aspect-[3/4] w-full overflow-hidden bg-black/40">
                      <Image 
                        src={prodImageUrl} 
                        alt="Product Preview" 
                        fill 
                        className="object-contain" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setProdImageUrl('')}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 font-body text-xs tracking-[0.25em] uppercase font-bold py-4 text-white transition-colors"
                >
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="bg-white/10 hover:bg-white/20 font-body text-xs tracking-[0.25em] uppercase font-bold py-4 px-6 text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Product List */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-display text-2xl tracking-widest text-white uppercase mb-6">
              Product Catalog
            </h2>

            {products.length === 0 ? (
              <div className="text-center py-20 border border-white/10 bg-white/[0.02]">
                <p className="font-body text-xs tracking-[0.25em] uppercase text-white/40">No Products in the database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(p => {
                  const categoryName = categories.find(c => c.id === p.category_id)?.name || 'Uncategorized'
                  return (
                    <div 
                      key={p.id} 
                      className="border border-white/10 bg-white/[0.02] group relative flex flex-col justify-between"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
                        <Image 
                          src={p.image_url} 
                          alt={p.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 30vw"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-600 text-white font-body text-[9px] tracking-widest uppercase px-2 py-0.5 font-semibold">
                            {p.tag || 'No Tag'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-body text-[9px] tracking-[0.2em] text-white/40 uppercase mb-1">
                            {categoryName}
                          </p>
                          <h3 className="font-body text-sm font-semibold text-white mb-2 line-clamp-1">{p.name}</h3>
                          <p className="font-body text-xs text-white/50 line-clamp-2 font-light mb-4 h-8 leading-normal">
                            {p.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="flex items-end justify-between pt-2 border-t border-white/5">
                          <div>
                            <span className="font-body text-sm font-bold text-red-500">₹{p.price_inr}</span>
                            <span className="font-body text-[10px] text-white/30 ml-2">${p.price_usd}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => editProduct(p)}
                              className="font-body text-[10px] tracking-wider uppercase text-white/60 hover:text-white border border-white/10 hover:border-white px-2 py-1 transition-all duration-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleProductDelete(p.id)}
                              className="font-body text-[10px] tracking-wider uppercase text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/50 px-2 py-1 transition-all duration-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Categories Tab */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Add Category Form */}
          <div className="md:col-span-4 bg-white/[0.02] border border-white/10 p-6 md:p-8">
            <h2 className="font-display text-2xl tracking-widest text-white mb-6 uppercase">
              Add Category
            </h2>
            
            <form onSubmit={handleCategorySubmit} className="space-y-5">
              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Category Name</label>
                <input 
                  type="text" 
                  value={catName}
                  onChange={(e) => handleNameChange(e.target.value, false)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. Accessories"
                />
              </div>

              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Slug (URL identifier)</label>
                <input 
                  type="text" 
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g. accessories"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 font-body text-xs tracking-[0.25em] uppercase font-bold py-4 text-white transition-colors pt-2"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* Categories list */}
          <div className="md:col-span-8 bg-white/[0.02] border border-white/10 p-6 md:p-8">
            <h2 className="font-display text-2xl tracking-widest text-white uppercase mb-6">
              Active Categories
            </h2>

            {categories.length === 0 ? (
              <p className="font-body text-xs tracking-[0.25em] uppercase text-white/40 py-8 text-center">No categories found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body text-xs">
                  <thead>
                    <tr className="border-b border-white/10 uppercase tracking-widest text-white/40">
                      <th className="py-4">Category Name</th>
                      <th className="py-4">Slug</th>
                      <th className="py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => {
                      const count = products.filter(p => p.category_id === c.id).length
                      return (
                        <tr key={c.id} className="border-b border-white/5 text-white/80 hover:text-white transition-colors">
                          <td className="py-4 flex items-center gap-2">
                            <span>{c.name}</span>
                            <span className="bg-white/10 text-white/60 font-body text-[9px] tracking-wide px-1.5 py-0.5 rounded">
                              {count} products
                            </span>
                          </td>
                          <td className="py-4 text-white/50">{c.slug}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleCategoryDelete(c.id)}
                              className="font-body text-[10px] tracking-wider uppercase text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/50 px-2 py-1 transition-all duration-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
