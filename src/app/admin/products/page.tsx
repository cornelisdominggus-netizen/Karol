'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])

  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'Custom Kaos',
    price: 'Rp 90.000',
    originalPrice: 'Rp 180.000',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('dscpl_admin_logged')
    if (!isLoggedIn) {
      router.replace('/admin/login')
      return
    }

    const saved = localStorage.getItem('dscpl_store_products')
    if (saved) {
      setProducts(JSON.parse(saved))
    } else {
      const defaultProducts = [
        { id: '1', title: 'Custom Kaos Lengan Pendek Oversize', category: 'Custom Kaos', price: 'Rp 90.000', originalPrice: 'Rp 180.000', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80' },
        { id: '2', title: 'Custom Hoodie Fleece Premium', category: 'Custom Hoodie', price: 'Rp 110.000', originalPrice: 'Rp 220.000', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80' },
        { id: '3', title: 'Custom Topi Trucker Jaring', category: 'Custom Topi', price: 'Rp 24.689', originalPrice: 'Rp 49.938', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80' }
      ]
      setProducts(defaultProducts)
      localStorage.setItem('dscpl_store_products', JSON.stringify(defaultProducts))
    }
  }, [router])

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.title || !newProduct.price) {
      alert('Nama produk dan harga wajib diisi!')
      return
    }

    const productToAdd = {
      id: Date.now().toString(),
      ...newProduct
    }

    const updated = [productToAdd, ...products]
    setProducts(updated)
    localStorage.setItem('dscpl_store_products', JSON.stringify(updated))
    window.dispatchEvent(new Event('dscpl_products_updated'))

    setNewProduct({
      title: '',
      category: 'Custom Kaos',
      price: 'Rp 90.000',
      originalPrice: 'Rp 180.000',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
    })

    alert('Berhasil menambahkan produk baru ke katalog toko!')
  }

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      const updated = products.filter(p => p.id !== id)
      setProducts(updated)
      localStorage.setItem('dscpl_store_products', JSON.stringify(updated))
      window.dispatchEvent(new Event('dscpl_products_updated'))
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-black text-white p-6 rounded-3xl shadow-md">
          <div>
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              ADMIN SELLER PANEL
            </span>
            <h1 className="text-2xl font-black mt-1">Kelola Katalog Produk Toko</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/orders" className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition">
              📦 Pesanan
            </Link>
            <Link href="/admin/cms" className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition">
              ✏️ CMS Teks
            </Link>
          </div>
        </div>

        <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-xs font-black text-red-600 uppercase tracking-widest">➕ Tambah Produk Baru ke Katalog</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black uppercase mb-1">Nama Produk</label>
              <input
                type="text"
                placeholder="Contoh: Custom Kaos Oversize Edisi Spesial"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase mb-1">Kategori</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
              >
                <option value="Custom Kaos">Custom Kaos</option>
                <option value="Custom Hoodie">Custom Hoodie</option>
                <option value="Custom Topi">Custom Topi</option>
                <option value="Custom Tas">Custom Tas</option>
                <option value="Merchandise">Merchandise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase mb-1">Harga Jual (Promo)</label>
              <input
                type="text"
                placeholder="Rp 90.000"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase mb-1">Harga Coret (Asli)</label>
              <input
                type="text"
                placeholder="Rp 180.000"
                value={newProduct.originalPrice}
                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black uppercase mb-1">URL Gambar / Foto Produk</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white font-black py-3.5 rounded-xl transition text-xs shadow-md uppercase tracking-wider cursor-pointer"
          >
            🚀 Publish Produk ke Katalog Pembeli
          </button>
        </form>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-xs font-black text-black uppercase tracking-widest">Daftar Produk Aktif ({products.length})</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col justify-between">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {prod.category}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-black line-clamp-2">{prod.title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm font-black text-red-600">{prod.price}</span>
                      <span className="text-[10px] text-gray-400 line-through">{prod.originalPrice}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="w-full mt-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    🗑️ Hapus Produk
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}