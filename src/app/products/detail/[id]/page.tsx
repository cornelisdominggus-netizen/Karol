'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SizeChartModal from '@/components/SizeChartModal'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id

  const [product, setProduct] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState('M - Regular')
  const [quantity, setQuantity] = useState(1)
  const [fileName, setFileName] = useState('')
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dscpl_store_products')
    if (saved) {
      try {
        const products = JSON.parse(saved)
        const found = products.find((p: any) => p.id.toString() === productId)
        if (found) {
          setProduct(found)
        }
      } catch (e) {
        console.error('Gagal memuat detail produk', e)
      }
    }
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return

    const cartItem = {
      cartId: Date.now(),
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      size: selectedSize,
      quantity: quantity,
      category: product.category,
      designFile: fileName || 'Tanpa file / Custom chat'
    }

    const existingCart = JSON.parse(localStorage.getItem('dscpl_cart') || '[]')
    const updatedCart = [...existingCart, cartItem]
    
    localStorage.setItem('dscpl_cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('dscpl_cart_updated'))

    alert(`Berhasil menambahkan "${product.title}" ke keranjang!`)
    router.push('/checkout')
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white text-black py-20 px-4 text-center">
        <h1 className="text-sm font-bold">Memuat Detail Produk...</h1>
        <Link href="/products" className="text-xs text-blue-600 underline mt-3 inline-block">← Kembali ke Katalog</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black py-10 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-black">Beranda</Link> / 
          <Link href="/products" className="hover:text-black ml-1">Katalog</Link> / 
          <span className="text-black font-black ml-1">{product.title}</span>
        </div>

        {/* Konten Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Sisi Kiri: Foto */}
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 h-[450px]">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Sisi Kanan: Spesifikasi & Aksi */}
          <div className="space-y-6">
            <div>
              <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {product.category || 'Custom Apparel'}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-black mt-3 leading-snug">{product.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-xs">★★★★★</span>
              <span className="text-xs text-gray-500 font-semibold">(12 ulasan pelanggan)</span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-black text-red-600">{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-600">
              🎁 Dapatkan koin bonus dengan membeli produk ini di DSCPL WEAR.
            </div>

            {/* Pilihan Ukuran & Tombol Size Chart */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase text-black">Ukuran</label>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="text-xs text-red-600 font-bold underline hover:text-red-800 cursor-pointer"
                >
                  📐 Lihat Panduan Ukuran
                </button>
              </div>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-black focus:outline-none"
              >
                <option value="S">S - Standar</option>
                <option value="M">M - Regular</option>
                <option value="L">L - Large</option>
                <option value="XL">XL - Extra Large</option>
              </select>
            </div>

            {/* Upload File */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-black">File Upload (Desain)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center space-y-2 bg-gray-50">
                <span className="text-xs text-gray-500 block">File : jpg, jpeg, png, pdf</span>
                <input
                  type="file"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white cursor-pointer"
                />
                {fileName && <p className="text-xs font-bold text-green-600">Terpilih: {fileName}</p>}
              </div>
            </div>

            {/* Kuantitas & Tombol Keranjang */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-xs font-bold hover:bg-gray-200">-</button>
                <span className="px-4 text-xs font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-xs font-bold hover:bg-gray-200">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow cursor-pointer text-center"
              >
                TAMBAH KE KERANJANG
              </button>
            </div>

            <div className="text-[11px] text-gray-400 pt-2 border-t">
              SKU: N/A | Kategori: Produk Custom, {product.category}
            </div>

          </div>

        </div>

      </div>

      {/* Render SizeChartModal */}
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
    </main>
  )
}