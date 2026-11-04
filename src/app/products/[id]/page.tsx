'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = (params?.id as string) || 'kaos'

  const [selectedColor, setSelectedColor] = useState('Hitam')
  const [selectedSize, setSelectedSize] = useState('L')
  const [quantity, setQuantity] = useState(1)
  
  // State untuk menangani File Upload & Live Preview Mockup
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Konfigurasi dinamis berdasarkan jenis produk yang dipilih
  let productTitle = 'Custom Kaos Lengan Pendek Oversize'
  let productPrice = 'Rp 90.000'
  let originalPrice = 'Rp 180.000'
  let mockupImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80' // Model Kaos Pendek

  if (productId.includes('panjang') || productId.includes('lengan-panjang')) {
    productTitle = 'Custom Kaos Lengan Panjang Dewasa 30s'
    productPrice = 'Rp 75.000'
    originalPrice = 'Rp 150.000'
    // Foto model kaos lengan panjang
    mockupImage = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80'
  } else if (productId.includes('hoodie')) {
    productTitle = 'Custom Hoodie Fleece Premium'
    productPrice = 'Rp 110.000'
    originalPrice = 'Rp 220.000'
    // Foto model hoodie
    mockupImage = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
  } else if (productId.includes('topi')) {
    productTitle = 'Custom Topi Trucker Jaring'
    productPrice = 'Rp 24.689'
    originalPrice = 'Rp 49.938'
    // Foto model topi
    mockupImage = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80'
  } else if (productId.includes('anak')) {
    productTitle = 'Custom Kaos Lengan Pendek Anak & Dewasa 30s'
    productPrice = 'Rp 50.000'
    originalPrice = 'Rp 100.000'
    mockupImage = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
  }

  const product = {
    title: productTitle,
    category: 'Produk Custom',
    originalPrice: originalPrice,
    promoPrice: productPrice,
    rating: 5,
    reviews: 4,
    description: `Custom ${productTitle} berkualitas tinggi standar distro. Unggah file desain Anda (JPG, PNG, PDF), dan lihat preview langsung pada mockup produk.`,
    colors: [
      { name: 'Hitam', hex: '#000000' },
      { name: 'Putih', hex: '#ffffff' },
      { name: 'Navy', hex: '#1e3a8a' },
      { name: 'Maroon', hex: '#b91c1c' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
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
      fileName: uploadedFile ? uploadedFile.name : 'Tidak ada desain diunggah'
    }

    const existingCart = JSON.parse(localStorage.getItem('dscpl_cart') || '[]')
    existingCart.push(cartItem)
    localStorage.setItem('dscpl_cart', JSON.stringify(existingCart))

    alert(`Berhasil menambahkan "${product.title}" (${selectedColor}, Ukuran ${selectedSize}) dengan desain: ${cartItem.fileName} ke keranjang!`)
    window.location.href = '/checkout'
  }

  return (
    <main className="min-h-screen bg-white text-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-black">Beranda</Link> / <Link href="/custom-order?type=kaos" className="hover:text-black">Produk Custom</Link> / <span className="text-black font-bold">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          
          {/* SISI KIRI: Foto Model Otomatis Menyesuaikan Produk + Kotak Panduan & Live Preview */}
          <div className="space-y-4">
            <div className="w-full h-[520px] bg-gray-100 rounded-3xl border border-gray-200 flex items-center justify-center relative overflow-hidden shadow-sm">
              <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase z-20 shadow">
                DSCPL MOCKUP PREVIEW
              </span>

              {/* Foto Model Dinamis Sesuai Produk */}
              <img src={mockupImage} alt="Model Produk" className="w-full h-full object-cover filter brightness-95" />

              {/* Overlay Panduan: Foto, Desain, Tulisan */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-wider shadow">
                    Foto 📷
                  </span>
                  <span className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-wider shadow">
                    Desain 🎨
                  </span>
                </div>

                {/* Kotak Area Cetak */}
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-white rounded-2xl flex items-center justify-center relative bg-black/20 shadow-2xl">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/70 px-2 py-1 rounded">
                    Area Cetak Sablon
                  </span>

                  {/* Live Preview Desain Pelanggan */}
                  {previewImage && (
                    <div className="absolute inset-2 bg-white/95 rounded-xl overflow-hidden flex items-center justify-center shadow-2xl">
                      <img src={previewImage} alt="Preview Desain" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <span className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-wider shadow">
                    Tulisan ✍️
                  </span>
                  {uploadedFile && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                      {uploadedFile.name}
                    </span>
                  )}
                </div>
              </div>

            </div>
            <p className="text-xs text-gray-500 text-center">
              {previewImage ? 'Desain Anda berhasil dimuat ke mockup produk.' : 'Unggah file JPG, PNG, atau PDF untuk melihat preview desain.'}
            </p>
          </div>

          {/* SISI KANAN: Informasi, Pilihan & Upload File */}
          <div className="space-y-6">
            <div>
              <span className="bg-gray-200 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-3xl font-black text-black mt-3">{product.title}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500 text-sm">★★★★★</span>
                <span className="text-xs text-gray-600 font-semibold">({product.reviews} ulasan pelanggan)</span>
              </div>
            </div>

            {/* Harga */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-baseline gap-3">
              <span className="text-sm text-gray-400 line-through font-semibold">{product.originalPrice}</span>
              <span className="text-2xl font-black text-red-600">{product.promoPrice}</span>
            </div>

            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* Pilihan Warna */}
            <div>
              <label className="block text-xs font-bold text-black uppercase mb-2">
                Pilih Warna: <span className="text-gray-600 font-normal">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-2">
                {product.colors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full border-2 transition ${selectedColor === c.name ? 'border-black scale-110 shadow-md' : 'border-gray-300'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Pilihan Ukuran */}
            <div>
              <label className="block text-xs font-bold text-black uppercase mb-2">
                Pilih Ukuran: <span className="text-gray-600 font-normal">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      selectedSize === size 
                        ? 'bg-black text-white border-black shadow-sm' 
                        : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Kotak Upload File Desain (JPG, JPEG, PNG, PDF) */}
            <div>
              <label className="block text-xs font-bold text-black uppercase mb-2">
                File Upload Desain (JPG, JPEG, PNG, PDF) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition relative cursor-pointer">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-2xl block mb-1">📁</span>
                <p className="text-xs font-bold text-black">
                  {uploadedFile ? uploadedFile.name : 'Seret file ke sini atau klik untuk memilih file'}
                </p>
                <span className="text-[10px] text-gray-500 mt-1 block">Mendukung format gambar dan dokumen PDF</span>
              </div>
            </div>

            {/* Tombol Aksi Tambah ke Keranjang */}
            <div className="flex items-center gap-4 pt-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 bg-gray-100 border border-gray-300 rounded-xl px-3 py-3.5 text-center text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition text-sm shadow-md text-center uppercase tracking-wider cursor-pointer"
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