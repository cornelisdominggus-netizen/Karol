'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders')
  
  // State Pesanan
  const [orders, setOrders] = useState<any[]>([])

  // State Produk Katalog (+ Input Harga Asli / Coret)
  const [products, setProducts] = useState<any[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newOriginalPrice, setNewOriginalPrice] = useState('')
  const [newCategory, setNewCategory] = useState('Custom Kaos')
  const [newImage, setNewImage] = useState('')

  // State CMS Pengaturan Website
  const [siteText, setSiteText] = useState({
    heroTitle: 'Precision Apparel & Custom Print Workshop',
    heroDesc: 'Pusat layanan custom apparel, sablon DTF berkualitas tinggi, dan penyediaan polosan standar distro di Depok.',
    promoAnnouncement: 'Event 99% : Selengkapnya'
  })

  useEffect(() => {
    const loadOrders = () => {
      const saved = localStorage.getItem('dscpl_orders')
      if (saved) { try { setOrders(JSON.parse(saved)) } catch (e) { setOrders([]) } }
    }

    const loadProducts = () => {
      const saved = localStorage.getItem('dscpl_store_products')
      if (saved) { 
        try { setProducts(JSON.parse(saved)) } catch (e) { setProducts([]) } 
      } else {
        const defaultProds = [
          { id: 1, title: 'Custom Topi Snapback Modern', price: 'Rp 69.127', originalPrice: 'Rp 85.000', category: 'Custom Topi', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=500' },
          { id: 2, title: 'Custom Kaos Lengan Pendek Oversized', price: 'Rp 90.000', originalPrice: 'Rp 180.000', category: 'Custom Kaos', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500' }
        ]
        setProducts(defaultProds)
        localStorage.setItem('dscpl_store_products', JSON.stringify(defaultProds))
      }
    }

    const loadSettings = () => {
      const saved = localStorage.getItem('dscpl_site_texts')
      if (saved) { try { setSiteText(prev => ({ ...prev, ...JSON.parse(saved) })) } catch (e) {} }
    }

    loadOrders()
    loadProducts()
    loadSettings()

    window.addEventListener('storage', loadOrders)
    return () => window.removeEventListener('storage', loadOrders)
  }, [])

  // Handler Pesanan
  const handleUpdateStatus = (id: number, newStatus: string) => {
    const updated = orders.map(ord => ord.id === id ? { ...ord, status: newStatus } : ord)
    setOrders(updated)
    localStorage.setItem('dscpl_orders', JSON.stringify(updated))
  }

  const handleDeleteOrder = (id: number) => {
    if (confirm('Hapus pesanan ini?')) {
      const updated = orders.filter(ord => ord.id !== id)
      setOrders(updated)
      localStorage.setItem('dscpl_orders', JSON.stringify(updated))
    }
  }

  // Handler Tambah Produk (Termasuk Harga Coret)
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice) return

    const newProd = {
      id: Date.now(),
      title: newTitle,
      price: newPrice,
      originalPrice: newOriginalPrice || 'Rp 150.000',
      category: newCategory,
      image: newImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500'
    }

    const updated = [newProd, ...products]
    setProducts(updated)
    localStorage.setItem('dscpl_store_products', JSON.stringify(updated))
    window.dispatchEvent(new Event('dscpl_products_updated'))

    setNewTitle('')
    setNewPrice('')
    setNewOriginalPrice('')
    setNewImage('')
    alert('Produk baru dengan harga coret berhasil ditambahkan ke katalog!')
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm('Hapus produk ini dari katalog?')) {
      const updated = products.filter(p => p.id !== id)
      setProducts(updated)
      localStorage.setItem('dscpl_store_products', JSON.stringify(updated))
      window.dispatchEvent(new Event('dscpl_products_updated'))
    }
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('dscpl_site_texts', JSON.stringify(siteText))
    window.dispatchEvent(new Event('dscpl_text_updated'))
    alert('Pengaturan website berhasil diperbarui!')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Admin */}
        <div className="bg-black text-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow">
          <div>
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              PANEL SUPER ADMIN DSCPL WEAR
            </span>
            <h1 className="text-2xl font-black mt-2">Pusat Kendali & Manajemen Toko ⚙️</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/products" className="bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl transition hover:bg-gray-100">
              Lihat Website Toko ➔
            </Link>
          </div>
        </div>

        {/* Tab Navigasi Admin */}
        <div className="flex gap-3 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'orders' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'
            }`}
          >
            📦 Manajemen Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'products' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'
            }`}
          >
            🛍️ Kelola & Tambah Katalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'settings' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'
            }`}
          >
            ⚙️ Pengaturan Promo & Teks Web
          </button>
        </div>

        {/* KONTEN TAB 1: MANAJEMEN PESANAN */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b pb-2">
              Daftar Pesanan Masuk Pelanggan
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <span className="text-4xl">📭</span>
                <p className="text-xs text-gray-500 font-semibold">Belum ada pesanan masuk dari halaman checkout.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-500 uppercase">
                      <th className="p-3">ID / Waktu</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Detail Item</th>
                      <th className="p-3">Total Harga</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-gray-500">
                          #{ord.id}
                          <span className="block text-[10px] text-gray-400">{new Date(ord.createdAt).toLocaleString()}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-black">{ord.customerName}</p>
                          <p className="text-[11px] text-gray-500">{ord.phone}</p>
                          <p className="text-[10px] text-gray-400">{ord.address}</p>
                        </td>
                        <td className="p-3 font-medium text-gray-800 max-w-xs">{ord.items}</td>
                        <td className="p-3 font-black text-red-600">{ord.totalPrice}</td>
                        <td className="p-3">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                            className="font-bold px-3 py-1.5 rounded-xl border text-xs focus:outline-none bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* KONTEN TAB 2: TAMBAH & KELOLA KATALOG (DENGAN INPUT HARGA CORET) */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Form Tambah Produk */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-600 border-b pb-2">
                + Tambah Produk Baru
              </h2>

              <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Custom Kaos Oversized"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Harga Jual Diskon *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 90.000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Harga Asli / Coret (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 180.000"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black"
                  >
                    <option value="Custom Kaos">Custom Kaos</option>
                    <option value="Custom Hoodie">Custom Hoodie</option>
                    <option value="Custom Topi">Custom Topi</option>
                    <option value="Custom Tas">Custom Tas</option>
                    <option value="Custom Merchandise">Custom Merchandise</option>
                    <option value="Alat & Bahan DTF">Alat & Bahan DTF</option>
                    <option value="Polosan">Polosan</option>
                    <option value="Download">Download</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">URL Gambar (Foto Produk)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer"
                >
                  SIMPAN PRODUK
                </button>
              </form>
            </div>

            {/* List Katalog Produk Saat Ini */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-black border-b pb-2">
                Daftar Katalog Aktif ({products.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-2xl border flex items-center justify-between gap-3">
                    <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-xl bg-white" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-black truncate">{p.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-red-600 font-black">{p.price}</span>
                        {p.originalPrice && <span className="text-[10px] text-gray-400 line-through">{p.originalPrice}</span>}
                      </div>
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">{p.category}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* KONTEN TAB 3: PENGATURAN PROMO & TEKS WEBSITE */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6 max-w-2xl">
            <h2 className="text-sm font-black uppercase tracking-wider text-red-600 border-b pb-2">
              ⚙️ Pengaturan CMS & Promo Website
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Judul Utama Hero (Beranda)</label>
                <input
                  type="text"
                  value={siteText.heroTitle}
                  onChange={(e) => setSiteText({ ...siteText, heroTitle: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Deskripsi Hero (Beranda)</label>
                <textarea
                  rows={3}
                  value={siteText.heroDesc}
                  onChange={(e) => setSiteText({ ...siteText, heroDesc: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-bold mb-1">Pengumuman Promo / Event</label>
                <input
                  type="text"
                  value={siteText.promoAnnouncement}
                  onChange={(e) => setSiteText({ ...siteText, promoAnnouncement: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer"
              >
                SIMPAN PERUBAHAN WEBSITE
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  )
}