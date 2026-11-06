'use client'

import { Suspense, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Import dinamis komponen 3D Mockup agar berjalan di sisi client
const Mockup3D = dynamic(() => import('@/components/Mockup3D'), { ssr: false })

function ProductDetail() {
  const params = useParams()
  const productId = (params?.id as string) || 'kaos'

  const [selectedColor, setSelectedColor] = useState('#ffffff')
  const [selectedSize, setSelectedSize] = useState('L')
  const [quantity, setQuantity] = useState(1)
  
  // State untuk 3D Mockup (Desain & Posisi)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [designScale, setDesignScale] = useState(0.8)
  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0.1)

  // Tentukan tipe apparel berdasarkan URL/ID produk
  let apparelType = 'kaos'
  let productTitle = 'Custom Kaos Lengan Pendek Oversize'
  let productPrice = 'Rp 90.000'
  let originalPrice = 'Rp 180.000'

  if (productId.includes('hoodie') || productId.toLowerCase().includes('hoodie')) {
    apparelType = 'hoodie'
    productTitle = 'Custom Hoodie Fleece Premium'
    productPrice = 'Rp 110.000'
    originalPrice = 'Rp 220.000'
  } else if (productId.includes('topi') || productId.toLowerCase().includes('topi')) {
    apparelType = 'topi'
    productTitle = 'Custom Topi Trucker Jaring'
    productPrice = 'Rp 24.689'
    originalPrice = 'Rp 49.938'
  } else if (productId.includes('tas') || productId.toLowerCase().includes('tas')) {
    apparelType = 'tas'
    productTitle = 'Custom Tas Premium'
    productPrice = 'Rp 85.000'
    originalPrice = 'Rp 170.000'
  } else if (productId.includes('oversized') || productId.toLowerCase().includes('oversize')) {
    apparelType = 'oversized'
    productTitle = 'Custom Kaos Lengan Pendek Oversize'
    productPrice = 'Rp 120.000'
    originalPrice = 'Rp 240.000'
  }

  const product = {
    title: productTitle,
    category: 'Produk Custom 3D',
    originalPrice: originalPrice,
    promoPrice: productPrice,
    rating: 5,
    reviews: 12,
    description: `Custom ${productTitle} berkualitas tinggi standar distro. Putar model 3D di sebelah kiri, unggah file desain Anda, dan sesuaikan posisinya secara real-time.`,
    colors: [
      { name: 'Putih', hex: '#ffffff' },
      { name: 'Hitam', hex: '#111111' },
      { name: 'Gray', hex: '#71717a' },
      { name: 'Navy', hex: '#1e1b4b' },
      { name: 'Maroon', hex: '#7f1d1d' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL']
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewImage(null)
      }
    }
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: productId,
      title: product.title,
      price: product.promoPrice,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
      image: previewImage,
      fileName: uploadedFile ? uploadedFile.name : 'Tidak ada desain diunggah'
    }

    const existingCart = JSON.parse(localStorage.getItem('dscpl_cart') || '[]')
    existingCart.push(cartItem)
    localStorage.setItem('dscpl_cart', JSON.stringify(existingCart))
    window.dispatchEvent(new Event('dscpl_cart_updated'))

    alert(`Berhasil menambahkan "${product.title}" ke keranjang!`)
    window.location.href = '/checkout'
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="text-xs font-semibold text-zinc-400 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-white">Beranda</Link> / <Link href="/products" className="hover:text-white">Katalog</Link> / <span className="text-white font-bold">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SISI KIRI: MENGGANTI FOTO MODEL DENGAN 3D MOCKUP INTERAKTIF */}
          <div className="lg:col-span-7 bg-zinc-900/50 rounded-3xl border border-zinc-800 p-4 shadow-2xl relative min-h-[580px] flex flex-col">
            <div className="flex justify-between items-center mb-2 px-2 z-10">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> 
                3D Interactive Mockup ({apparelType.toUpperCase()})
              </span>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-bold">
                Seret baju untuk memutar • Scroll untuk zoom
              </span>
            </div>

            <div className="w-full flex-1 flex items-center justify-center rounded-2xl bg-zinc-950/80 border border-zinc-800 overflow-hidden relative min-h-[500px]">
              <Mockup3D 
                apparelType={apparelType} 
                color={selectedColor} 
                designImage={previewImage}
                designScale={designScale}
                positionX={positionX}
                positionY={positionY}
                onPositionChange={(x, y) => {
                  setPositionX(x)
                  setPositionY(y)
                }}
              />
            </div>
          </div>

          {/* SISI KANAN: Informasi Produk, Warna, Ukuran & Upload */}
          <div className="lg:col-span-5 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-6">
            <div>
              <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-2xl font-black text-white mt-3">{product.title}</h1>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500 text-sm">★★★★★</span>
                <span className="text-xs text-zinc-400 font-semibold">({product.reviews} ulasan pelanggan)</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-baseline gap-3">
              <span className="text-xs text-zinc-500 line-through font-semibold">{product.originalPrice}</span>
              <span className="text-2xl font-black text-red-500">{product.promoPrice}</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {product.description}
            </p>

            {/* Pilihan Warna Bahan */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase">
                Pilih Warna Bahan: <span className="text-white font-normal">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(c.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${
                      selectedColor === c.hex ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-zinc-900 scale-110' : 'border-zinc-700'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Pilihan Ukuran */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase">
                Pilih Ukuran: <span className="text-white font-normal">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedSize === size 
                        ? 'bg-white text-black border-white shadow' 
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Kotak Upload File Desain */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase">
                Unggah Artwork Desain (PNG Transparan) *
              </label>
              <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-4 text-center bg-zinc-950/60 hover:border-zinc-500 transition relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-xl block mb-1">📁</span>
                <p className="text-xs font-bold text-zinc-200">
                  {uploadedFile ? uploadedFile.name : 'Klik atau seret file desain ke sini'}
                </p>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">Desain akan langsung tampil di mockup 3D</span>
              </div>
            </div>

            {/* Tombol Aksi Tambah ke Keranjang */}
            <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-3.5 text-center text-xs font-bold text-white focus:outline-none focus:border-white"
              />
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-3.5 px-6 rounded-xl transition text-xs shadow-lg text-center uppercase tracking-wider cursor-pointer"
              >
                🛒 Tambahkan ke Keranjang
              </button>
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-xs font-bold">Memuat produk...</div>}>
      <ProductDetail />
    </Suspense>
  )
}