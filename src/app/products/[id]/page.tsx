'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const Mockup3D = dynamic(() => import('@/components/Mockup3D'), { ssr: false })

function ProductDetailContent() {
  const params = useParams()
  const router = useRouter()
  const rawId = (params?.id as string) || '1'
  const productId = decodeURIComponent(rawId)

  const [dbProduct, setDbProduct] = useState<any>(null)
  const [loadingDb, setLoadingDb] = useState(true)

  const [selectedColor, setSelectedColor] = useState('#ffffff')
  const [selectedSize, setSelectedSize] = useState('L')
  const [quantity, setQuantity] = useState(1)
  const [apparelType, setApparelType] = useState('kaos')
  
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front')
  const [uploadedFileFront, setUploadedFileFront] = useState<File | null>(null)
  const [previewImageFront, setPreviewImageFront] = useState<string | null>(null)
  const [uploadedFileBack, setUploadedFileBack] = useState<File | null>(null)
  const [previewImageBack, setPreviewImageBack] = useState<string | null>(null)

  const [designScale, setDesignScale] = useState(0.8)
  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0.1)

  useEffect(() => {
    const fetchDbProduct = async () => {
      if (!isNaN(Number(productId))) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', Number(productId))
          .maybeSingle()
        if (data) {
          setDbProduct(data)
          const cat = (data.category || '').toLowerCase()
          const title = (data.title || '').toLowerCase()
          if (cat.includes('hoodie') || title.includes('hoodie')) setApparelType('hoodie')
          else if (cat.includes('topi') || title.includes('topi')) setApparelType('topi')
          else if (cat.includes('oversize') || title.includes('oversize')) setApparelType('oversized')
        }
      } else {
        if (productId.includes('hoodie')) setApparelType('hoodie')
        else if (productId.includes('topi')) setApparelType('topi')
        else if (productId.includes('oversized') || productId.includes('oversize')) setApparelType('oversized')
      }
      setLoadingDb(false)
    }
    fetchDbProduct()
  }, [productId])

  const productTitle = dbProduct ? dbProduct.title : `Custom ${apparelType.toUpperCase()} Premium`
  const productPrice = dbProduct ? dbProduct.price : 'Rp 90.000'
  const originalPrice = dbProduct ? (dbProduct.original_price || 'Rp 180.000') : 'Rp 180.000'
  const productImage = dbProduct?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500'

  // Deteksi apakah produk ini berupa apparel siap pakai (bukan produk sablon custom 3D)
  // Berdasarkan kategori database atau nama produk
  const categoryName = (dbProduct?.category || '').toLowerCase()
  const isCustom3DProduct = 
    categoryName.includes('custom kaos') || 
    categoryName.includes('custom oversized') || 
    categoryName.includes('custom hoodie') || 
    categoryName.includes('custom topi') ||
    categoryName === 'kaos' ||
    categoryName === 'oversized' ||
    categoryName === 'hoodie' ||
    categoryName === 'topi'

  const availableColors = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Black', hex: '#111111' },
    { name: 'Gray', hex: '#71717a' },
    { name: 'Navy', hex: '#1e1b4b' },
    { name: 'Red', hex: '#7f1d1d' }
  ]

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedFileFront(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewImageFront(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedFileBack(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewImageBack(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const currentDesigns = useMemo(() => ({
    front: { image: previewImageFront, scale: designScale, x: positionX, y: positionY },
    back: { image: previewImageBack, scale: designScale, x: positionX, y: positionY }
  }), [previewImageFront, previewImageBack, designScale, positionX, positionY])

  const compressImage = (base64Str: string, maxWidth = 400, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => resolve(base64Str)
    })
  }

  const handleAddToCart = async () => {
    try {
      const compressedFront = previewImageFront ? await compressImage(previewImageFront) : null
      const compressedBack = previewImageBack ? await compressImage(previewImageBack) : null

      const cartItem = {
        cartId: `${productId}-${selectedSize}-${Date.now()}`,
        id: productId,
        title: productTitle,
        price: productPrice,
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
        image: isCustom3DProduct ? (compressedFront || productImage) : productImage,
        frontDesignImage: isCustom3DProduct ? compressedFront : null,
        backDesignImage: isCustom3DProduct ? compressedBack : null,
        fileName: isCustom3DProduct 
          ? `Depan: ${uploadedFileFront ? uploadedFileFront.name : 'Tidak ada'} | Belakang: ${uploadedFileBack ? uploadedFileBack.name : 'Tidak ada'}`
          : 'Apparel Siap Pakai (Tanpa Custom Sablon)',
        category: dbProduct?.category || apparelType
      }

      const existingCart = JSON.parse(localStorage.getItem('dscpl_cart') || '[]')
      existingCart.push(cartItem)
      localStorage.setItem('dscpl_cart', JSON.stringify(existingCart))
      window.dispatchEvent(new Event('dscpl_cart_updated'))

      alert(`Berhasil menambahkan "${productTitle}" ke keranjang!`)
      router.push('/checkout')
    } catch (err) {
      console.error('Gagal menyimpan ke keranjang:', err)
      alert('Penyimpanan browser penuh. Coba bersihkan keranjang belanja Anda.')
    }
  }

  if (loadingDb) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-xs font-bold">
        Memuat Produk...
      </main>
    )
  }

  // JIKA BUKAN PRODUK CUSTOM 3D (CONTOH: CHRISTMAS SERIES / APPAREL JADI)
  if (!isCustom3DProduct) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white py-8 px-4 sm:px-6 md:px-10 selection:bg-white selection:text-black">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-white">Beranda</Link> / <Link href="/products" className="hover:text-white">Katalog</Link> / <span className="text-zinc-300 font-bold">{productTitle}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* FOTO PRODUK ASLI DI KIRI */}
            <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-2xl overflow-hidden aspect-square flex items-center justify-center relative">
              <img src={productImage} alt={productTitle} className="w-full h-full object-cover rounded-2xl" />
              <span className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {dbProduct?.category || 'Apparel Series'}
              </span>
            </div>

            {/* DETAIL & CHECKOUT DI KANAN */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="space-y-2 border-b border-zinc-800 pb-4">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {productTitle}
                </h1>
                <div className="flex items-baseline gap-3 pt-1">
                  {originalPrice && <span className="text-xs text-zinc-500 line-through font-semibold">{originalPrice}</span>}
                  <span className="text-2xl font-black text-red-500">{productPrice}</span>
                </div>
              </div>

              {/* UKURAN */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase">Size / Ukuran</label>
                <div className="grid grid-cols-6 gap-2">
                  {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase transition border cursor-pointer ${
                        selectedSize === size ? 'bg-white text-black border-white shadow' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* JUMLAH & TOMBOL ADD TO CART */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-800 rounded-xl w-32 overflow-hidden bg-zinc-950">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-xs font-bold text-zinc-400 hover:text-white transition">−</button>
                    <span className="flex-1 text-center text-xs font-black">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-xs font-bold text-zinc-400 hover:text-white transition">+</button>
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">Stok Tersedia</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition shadow-xl cursor-pointer"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // JIKA PRODUK KUSTOM 3D (TAMPILKAN STUDIO 3D SEPERTI BIASA)
  return (
    <main className="min-h-screen bg-zinc-950 text-white py-6 px-4 sm:px-6 md:px-10 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-white">Beranda</Link> / <Link href="/products" className="hover:text-white">Katalog</Link> / <span className="text-zinc-300 font-bold">{productTitle}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col sticky top-6">
            <div className="flex flex-wrap justify-between items-center mb-3 px-2 z-10 gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> 
                Studio 3D Mockup ({apparelType.toUpperCase()})
              </span>

              <div className="flex bg-zinc-950 border border-zinc-700 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setViewSide('front')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${viewSide === 'front' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
                >
                  Sisi Depan {previewImageFront ? '✓' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide('back')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${viewSide === 'back' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
                >
                  Sisi Belakang {previewImageBack ? '✓' : ''}
                </button>
              </div>
            </div>

            <div className="w-full h-[550px] flex items-center justify-center rounded-2xl bg-zinc-950/80 border border-zinc-800 overflow-hidden relative">
              <Mockup3D 
                apparelType={apparelType} 
                color={selectedColor} 
                designs={currentDesigns}
                viewSide={viewSide}
              />
            </div>
            <span className="text-[10px] text-center text-zinc-500 mt-3 block">
              Menampilkan: <strong className="text-white">{viewSide === 'front' ? 'SISI DEPAN' : 'SISI BELAKANG'}</strong>. Klik tombol di atas untuk beralih sisi.
            </span>
          </div>

          <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="space-y-1 border-b border-zinc-800 pb-4">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                {productTitle}
              </h1>
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-xs text-zinc-500 line-through font-semibold">{originalPrice}</span>
                <span className="text-xl font-black text-red-500">{productPrice}</span>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                Sesuaikan Posisi & Skala Desain
              </span>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                  <span>Ukuran (Scale)</span>
                  <span>{Math.round(designScale * 100)}%</span>
                </div>
                <input type="range" min="0.3" max="1.5" step="0.05" value={designScale} onChange={(e) => setDesignScale(parseFloat(e.target.value))} className="w-full accent-red-600 cursor-pointer" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                  <span>Geser Kiri / Kanan</span>
                  <span>{positionX.toFixed(2)}</span>
                </div>
                <input type="range" min="-0.5" max="0.5" step="0.05" value={positionX} onChange={(e) => setPositionX(parseFloat(e.target.value))} className="w-full accent-red-600 cursor-pointer" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                  <span>Geser Atas / Bawah</span>
                  <span>{positionY.toFixed(2)}</span>
                </div>
                <input type="range" min="-0.5" max="0.8" step="0.05" value={positionY} onChange={(e) => setPositionY(parseFloat(e.target.value))} className="w-full accent-red-600 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase">Jenis Pakaian</label>
              <div className="grid grid-cols-2 gap-2">
                {['kaos', 'oversized', 'hoodie', 'topi'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setApparelType(type)}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase transition border cursor-pointer ${apparelType === type ? 'bg-white text-black border-white shadow' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase">
                Warna Bahan: <span className="text-zinc-500 font-normal">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {availableColors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${selectedColor === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'border-zinc-700'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase">Size / Ukuran</label>
              <div className="grid grid-cols-6 gap-2">
                {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition border cursor-pointer ${selectedSize === size ? 'bg-white text-black border-white shadow' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                Unggah Artwork (PNG Transparan) *
              </span>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase">📁 Desain Sisi Depan</label>
                <div onClick={() => setViewSide('front')} className={`border-2 border-dashed rounded-2xl p-3 text-center bg-zinc-950 transition relative cursor-pointer ${viewSide === 'front' ? 'border-white bg-zinc-900' : 'border-zinc-700 hover:border-zinc-400'}`}>
                  <input type="file" accept="image/*" onChange={handleFrontUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <p className="text-xs font-bold text-zinc-300 truncate">
                    {uploadedFileFront ? `✓ ${uploadedFileFront.name}` : 'Klik untuk upload desain DEPAN'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase">📁 Desain Sisi Belakang</label>
                <div onClick={() => setViewSide('back')} className={`border-2 border-dashed rounded-2xl p-3 text-center bg-zinc-950 transition relative cursor-pointer ${viewSide === 'back' ? 'border-white bg-zinc-900' : 'border-zinc-700 hover:border-zinc-400'}`}>
                  <input type="file" accept="image/*" onChange={handleBackUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <p className="text-xs font-bold text-zinc-300 truncate">
                    {uploadedFileBack ? `✓ ${uploadedFileBack.name}` : 'Klik untuk upload desain BELAKANG'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-zinc-800 rounded-xl w-32 overflow-hidden bg-zinc-950">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition">−</button>
                  <span className="flex-1 text-center text-xs font-black">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition">+</button>
                </div>
                <span className="text-xs text-zinc-500 font-bold">Stok Tersedia</span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition shadow-xl cursor-pointer"
              >
                ADD TO CART
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
    <Suspense fallback={<main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-xs font-bold">Memuat produk...</main>}>
      <ProductDetailContent />
    </Suspense>
  )
}