'use client'

import { useState, useEffect, useRef } from 'react'
import { AdminToast, Toast } from './components/AdminToast'
import { AdminSidebar, AdminTab } from './components/AdminSidebar'
import { AdminMobileNav } from './components/AdminMobileNav'
import { AdminHeader } from './components/AdminHeader'
import { ProductsTab, Product, Category } from './components/ProductsTab'
import { CategoriesTab } from './components/CategoriesTab'
import { MediaTab, MediaItem } from './components/MediaTab'
import { OrdersTab, Order } from './components/OrdersTab'
import { SettingsTab, AdminUser, NotificationLog } from './components/SettingsTab'
import { MediaPickerModal } from './components/MediaPickerModal'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products')
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
  const [prodImages, setProdImages] = useState<string[]>([])
  const [prodIsSoldOut, setProdIsSoldOut] = useState<boolean>(false)

  // Media Library & Bulk Upload State
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [selectedMediaCategory, setSelectedMediaCategory] = useState<string>('all')
  const [mediaSearchQuery, setMediaSearchQuery] = useState('')
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [bulkUploadCatId, setBulkUploadCatId] = useState<string>('')
  const bulkFileInputRef = useRef<HTMLInputElement>(null)
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false)
  const [selectedMediaForProduct, setSelectedMediaForProduct] = useState<string[]>([])

  // Upload State
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; fileName: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Orders, Admins, and Logs states
  const [orders, setOrders] = useState<Order[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)

  // Admin notification form states
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminNotify, setNewAdminNotify] = useState(true)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

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

  // Fetch orders list
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
      } else {
        showToast(data.error || 'Failed to fetch orders', 'error')
      }
    } catch (err) {
      showToast('Error loading orders', 'error')
    } finally {
      setOrdersLoading(false)
    }
  }

  // Fetch administrator notification list
  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true)
      const res = await fetch('/api/admin/admins')
      const data = await res.json()
      if (res.ok) {
        setAdmins(data.admins || [])
      } else {
        showToast(data.error || 'Failed to fetch admin list', 'error')
      }
    } catch (err) {
      showToast('Error loading admin list', 'error')
    } finally {
      setAdminsLoading(false)
    }
  }

  // Fetch notification dispatch logs
  const fetchLogs = async () => {
    try {
      setLogsLoading(true)
      const res = await fetch('/api/admin/notification-logs')
      const data = await res.json()
      if (res.ok) {
        setLogs(data.logs || [])
      } else {
        showToast(data.error || 'Failed to fetch notification logs', 'error')
      }
    } catch (err) {
      showToast('Error loading notification logs', 'error')
    } finally {
      setLogsLoading(false)
    }
  }

  // Clear notification dispatch logs
  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all notification logs?')) return

    try {
      const res = await fetch('/api/admin/notification-logs', {
        method: 'DELETE',
      })
      if (res.ok) {
        setLogs([])
        showToast('All email dispatch logs cleared!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to clear logs', 'error')
      }
    } catch (err) {
      showToast('Error clearing logs', 'error')
    }
  }

  // Trigger loading when tab switches
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    } else if (activeTab === 'settings') {
      fetchAdmins()
      fetchLogs()
    }
  }, [activeTab])

  // Update order status (paid, shipped, delivered, etc.)
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)))
        showToast(`Order status updated to ${status}!`, 'success')
      } else {
        showToast(data.error || 'Failed to update status', 'error')
      }
    } catch (err) {
      showToast('Error updating order status', 'error')
    }
  }

  // Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== orderId))
        showToast('Order deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete order', 'error')
      }
    } catch (err) {
      showToast('Error deleting order', 'error')
    }
  }

  // Add an admin notification email
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminEmail) {
      showToast('Email is required', 'error')
      return
    }

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName || null,
          receive_notifications: newAdminNotify,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setAdmins([...admins, data])
        setNewAdminEmail('')
        setNewAdminName('')
        setNewAdminNotify(true)
        showToast('Admin email registered successfully!', 'success')
      } else {
        showToast(data.error || 'Failed to register admin', 'error')
      }
    } catch (err) {
      showToast('Error registering admin', 'error')
    }
  }

  // Delete an admin notification email
  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin config?')) return

    try {
      const res = await fetch(`/api/admin/admins?id=${adminId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setAdmins(admins.filter((a) => a.id !== adminId))
        showToast('Admin configuration deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete admin config', 'error')
      }
    } catch (err) {
      showToast('Error deleting admin config', 'error')
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

  // Fetch Media Items
  const fetchMediaData = async (catId?: string) => {
    try {
      setMediaLoading(true)
      const targetCat = catId !== undefined ? catId : selectedMediaCategory
      const url = targetCat && targetCat !== 'all' ? `/api/admin/media?category_id=${targetCat}` : '/api/admin/media'
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setMediaList(data.media || [])
      } else {
        showToast(data.error || 'Failed to fetch media library', 'error')
      }
    } catch (err) {
      showToast('Error loading media library', 'error')
    } finally {
      setMediaLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'media' || showMediaPickerModal) {
      fetchMediaData()
    }
  }, [activeTab, showMediaPickerModal, selectedMediaCategory])

  // Bulk Upload Handler
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const total = files.length
    let successCount = 0

    try {
      setIsBulkUploading(true)
      showToast(`Uploading ${total} image(s)...`, 'info')

      for (let i = 0; i < total; i++) {
        const file = files[i]
        setUploadProgress({ current: i + 1, total, fileName: file.name })

        const formData = new FormData()
        formData.append('files', file)
        if (bulkUploadCatId) {
          formData.append('category_id', bulkUploadCatId)
        }

        try {
          const res = await fetch('/api/admin/media/upload-bulk', {
            method: 'POST',
            body: formData,
          })
          if (res.ok) successCount++
        } catch (singleErr) {
          console.error(`Error uploading ${file.name}:`, singleErr)
        }
      }

      if (successCount > 0) {
        showToast(`Successfully uploaded ${successCount} of ${total} image(s)!`, 'success')
        fetchMediaData()
      } else {
        showToast('Bulk upload failed', 'error')
      }
    } catch (err) {
      showToast('Error during bulk upload', 'error')
    } finally {
      setIsBulkUploading(false)
      setUploadProgress(null)
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = ''
      }
    }
  }

  // Delete Media Item
  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media image?')) return
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        showToast('Media image deleted successfully!', 'success')
        fetchMediaData()
      } else {
        showToast(data.error || 'Failed to delete media image', 'error')
      }
    } catch (err) {
      showToast('Error deleting media image', 'error')
    }
  }

  // Handle local multi-image upload for products
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const total = files.length
    const uploadedUrls: string[] = []

    try {
      setUploading(true)
      showToast(`Uploading ${total} image(s)...`, 'info')

      for (let i = 0; i < total; i++) {
        const file = files[i]
        setUploadProgress({ current: i + 1, total, fileName: file.name })

        const formData = new FormData()
        formData.append('files', file)
        if (prodCategoryId) {
          formData.append('category_id', prodCategoryId)
        }

        try {
          const res = await fetch('/api/admin/media/upload-bulk', {
            method: 'POST',
            body: formData,
          })
          const data = await res.json()
          if (res.ok && data.media) {
            const newUrls = data.media.map((m: any) => m.image_url)
            uploadedUrls.push(...newUrls)
          }
        } catch (singleErr) {
          console.error(`Error uploading ${file.name}:`, singleErr)
        }
      }

      if (uploadedUrls.length > 0) {
        setProdImages((prev) => Array.from(new Set([...prev, ...uploadedUrls])))
        setProdImageUrl((prev) => prev || uploadedUrls[0])
        showToast(`Successfully uploaded ${uploadedUrls.length} image(s)!`, 'success')
      } else {
        showToast('Image upload failed', 'error')
      }
    } catch (err) {
      showToast('Error uploading images', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
        setCategories(categories.filter((c) => c.id !== id))
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
    const primaryImg = prodImages.length > 0 ? prodImages[0] : prodImageUrl
    if (!prodName || !prodSlug || !prodPriceInr || !primaryImg) {
      showToast('Name, slug, price, and at least one image are required', 'error')
      return
    }

    const payload = {
      id: editingId,
      name: prodName,
      slug: prodSlug,
      description: prodDesc,
      price_inr: parseFloat(prodPriceInr),
      price_usd: parseFloat(prodPriceInr) / 83,
      image_url: primaryImg,
      images: prodImages.length > 0 ? prodImages : [primaryImg],
      tag: prodTag,
      category_id: prodCategoryId || null,
      is_sold_out: prodIsSoldOut,
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
          setProducts(products.map((p) => (p.id === editingId ? data : p)))
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
        setProducts(products.filter((p) => p.id !== id))
        showToast('Product deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete product', 'error')
      }
    } catch (err) {
      showToast('Error deleting product', 'error')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id)
    setProdName(product.name)
    setProdSlug(product.slug)
    setProdDesc(product.description || '')
    setProdPriceInr(product.price_inr.toString())
    setProdPriceUsd(product.price_usd.toString())
    setProdTag(product.tag || '')
    setProdCategoryId(product.category_id || '')
    setProdIsSoldOut(Boolean(product.is_sold_out))
    const mainImg = product.image_url || (product.images && product.images[0]) || ''
    setProdImageUrl(mainImg)
    setProdImages(product.images && product.images.length > 0 ? product.images : mainImg ? [mainImg] : [])
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
    setProdImages([])
    setProdIsSoldOut(false)
    setSelectedMediaForProduct([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 w-full h-full overflow-hidden font-body relative">
        {/* Toast Overlay */}
        <AdminToast toast={toast} />

        {/* Upload Progress Overlay */}
        {(uploading || isBulkUploading) && (
          <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/15 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl space-y-3">
              <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-display text-base tracking-widest text-white uppercase font-bold">Uploading Assets</p>
              <p className="font-body text-xs text-white/70 font-semibold tracking-wider">
                {uploadProgress ? `File ${uploadProgress.current} of ${uploadProgress.total}` : 'Processing images...'}
              </p>
              {uploadProgress?.fileName && (
                <p className="font-body text-[10px] text-white/40 truncate px-2" title={uploadProgress.fileName}>
                  {uploadProgress.fileName}
                </p>
              )}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: uploadProgress ? `${(uploadProgress.current / uploadProgress.total) * 100}%` : '50%' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Header & Drawer */}
        <AdminMobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setViewState={setViewState}
          counts={{
            products: products.length,
            categories: categories.length,
            media: mediaList.length,
            orders: orders.length,
          }}
        />

        {/* Desktop Sidebar Navigation */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setViewState={setViewState}
          counts={{
            products: products.length,
            categories: categories.length,
            media: mediaList.length,
            orders: orders.length,
          }}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 overflow-y-auto bg-[#080808] w-full custom-scrollbar">
          <main className="max-w-[1280px] mx-auto px-6 py-6 w-full space-y-8">
            <AdminHeader
              activeTab={activeTab}
              viewState={viewState}
              setViewState={setViewState}
              resetProductForm={resetProductForm}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-9 h-9 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-body text-xs tracking-[0.25em] uppercase text-white/40 font-semibold">
                  Loading ZANKA Dashboard...
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'products' && (
                  <ProductsTab
                    products={products}
                    categories={categories}
                    viewState={viewState}
                    setViewState={setViewState}
                    editingId={editingId}
                    prodName={prodName}
                    setProdName={setProdName}
                    prodSlug={prodSlug}
                    setProdSlug={setProdSlug}
                    prodDesc={prodDesc}
                    setProdDesc={setProdDesc}
                    prodPriceInr={prodPriceInr}
                    setProdPriceInr={setProdPriceInr}
                    prodPriceUsd={prodPriceUsd}
                    setProdPriceUsd={setProdPriceUsd}
                    prodTag={prodTag}
                    setProdTag={setProdTag}
                    prodCategoryId={prodCategoryId}
                    setProdCategoryId={setProdCategoryId}
                    prodImageUrl={prodImageUrl}
                    setProdImageUrl={setProdImageUrl}
                    prodImages={prodImages}
                    setProdImages={setProdImages}
                    prodIsSoldOut={prodIsSoldOut}
                    setProdIsSoldOut={setProdIsSoldOut}
                    handleNameChange={handleNameChange}
                    handleProductSubmit={handleProductSubmit}
                    handleProductDelete={handleProductDelete}
                    handleEditProduct={handleEditProduct}
                    resetProductForm={resetProductForm}
                    handleImageUpload={handleImageUpload}
                    fileInputRef={fileInputRef}
                    setShowMediaPickerModal={setShowMediaPickerModal}
                  />
                )}

                {activeTab === 'categories' && (
                  <CategoriesTab
                    categories={categories}
                    products={products}
                    catName={catName}
                    setCatName={setCatName}
                    catSlug={catSlug}
                    setCatSlug={setCatSlug}
                    handleNameChange={handleNameChange}
                    handleCategorySubmit={handleCategorySubmit}
                    handleCategoryDelete={handleCategoryDelete}
                  />
                )}

                {activeTab === 'media' && (
                  <MediaTab
                    mediaList={mediaList}
                    categories={categories}
                    mediaLoading={mediaLoading}
                    selectedMediaCategory={selectedMediaCategory}
                    setSelectedMediaCategory={setSelectedMediaCategory}
                    mediaSearchQuery={mediaSearchQuery}
                    setMediaSearchQuery={setMediaSearchQuery}
                    bulkUploadCatId={bulkUploadCatId}
                    setBulkUploadCatId={setBulkUploadCatId}
                    handleBulkUpload={handleBulkUpload}
                    handleDeleteMedia={handleDeleteMedia}
                    bulkFileInputRef={bulkFileInputRef}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'orders' && (
                  <OrdersTab
                    orders={orders}
                    ordersLoading={ordersLoading}
                    handleUpdateOrderStatus={handleUpdateOrderStatus}
                    handleDeleteOrder={handleDeleteOrder}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsTab
                    admins={admins}
                    adminsLoading={adminsLoading}
                    logs={logs}
                    logsLoading={logsLoading}
                    newAdminEmail={newAdminEmail}
                    setNewAdminEmail={setNewAdminEmail}
                    newAdminName={newAdminName}
                    setNewAdminName={setNewAdminName}
                    newAdminNotify={newAdminNotify}
                    setNewAdminNotify={setNewAdminNotify}
                    handleAddAdmin={handleAddAdmin}
                    handleDeleteAdmin={handleDeleteAdmin}
                    handleClearLogs={handleClearLogs}
                  />
                )}
              </>
            )}
          </main>
        </div>

        {/* Media Picker Modal */}
        <MediaPickerModal
          isOpen={showMediaPickerModal}
          onClose={() => setShowMediaPickerModal(false)}
          mediaList={mediaList}
          categories={categories}
          selectedMediaCategory={selectedMediaCategory}
          setSelectedMediaCategory={setSelectedMediaCategory}
          mediaSearchQuery={mediaSearchQuery}
          setMediaSearchQuery={setMediaSearchQuery}
          selectedMediaForProduct={selectedMediaForProduct}
          setSelectedMediaForProduct={setSelectedMediaForProduct}
          onConfirmSelection={(urls) => {
            if (urls.length > 0) {
              if (!prodImageUrl) {
                setProdImageUrl(urls[0])
              }
              setProdImages((prev) => Array.from(new Set([...prev, ...urls])))
              showToast(`Added ${urls.length} images to product gallery`, 'success')
            }
          }}
        />
      </div>
    )
  }
