'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const Mockup3D = dynamic(() => import('@/components/Mockup3D'), { ssr: false })

type ProductReview = {
  id: number
  product_id: number
  name: string
  rating: number
  comment: string
  image_url: string | null
  admin_reply: string | null
  created_at: string
}

function ShareButton({ productTitle }: { productTitle?: string }) {
  const handleShare = async () => {
    const shareData = {
      title: productTitle || 'DSCPL WEAR',
      text: `Cek produk keren ini di DSCPL WEAR: ${productTitle || ''}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share dibatalkan')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Tautan produk berhasil disalin ke clipboard!')
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 cursor-pointer shadow-lg mt-3"
    >
      <span className="text-sm">🔗</span> BAGIKAN PRODUK
    </button>
  )
}

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
  
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  const [viewSide, setViewSide] = useState<'front' | 'back'>('front')
  const [uploadedFileFront, setUploadedFileFront] = useState<File | null>(null)
  const [previewImageFront, setPreviewImageFront] = useState<string | null>(null)
  const [uploadedFileBack, setUploadedFileBack] = useState<File | null>(null)
  const [previewImageBack, setPreviewImageBack] = useState<string | null>(null)

  const [designScale, setDesignScale] = useState(0.8)
  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0.1)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewerName, setReviewerName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    const fetchDbProductAndReviews = async () => {
      let data = null

      if (!isNaN(Number(productId))) {
        const res = await supabase
          .from('products')
          .select('*')
          .eq('id', Number(productId))
          .maybeSingle()
        data = res.data
      } else {
        const cleanSlug = decodeURIComponent(productId).replace(/[-_]/g, ' ').trim()
        const res = await supabase
          .from('products')
          .select('*')
          .or(`title.ilike.%${cleanSlug}%,category.ilike.%${cleanSlug}%`)
          .limit(1)
          .maybeSingle()
        data = res.data
      }

      if (data) {
        setDbProduct(data)
        const cat = (data.category || data.kategori || '').toLowerCase()
        const title = (data.title || data.name || '').toLowerCase()
        if (cat.includes('hoodie') || title.includes('hoodie')) setApparelType('hoodie')
        else if (cat.includes('topi') || title.includes('topi')) setApparelType('topi')
        else if (cat.includes('oversize') || title.includes('oversize')) setApparelType('oversized')

        if (data.colors && Array.isArray(data.colors) && data.colors.length > 0) {
          setSelectedColor(data.colors[0])
        }

        const { data: revData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', data.id)
          .order('created_at', { ascending: false })

        if (revData) {
          setReviews(revData as ProductReview[])
        }
      }

      setLoadingDb(false)
    }
    fetchDbProductAndReviews()
  }, [productId])

  const productTitle = dbProduct?.title || dbProduct?.name || `Custom ${apparelType.toUpperCase()} Premium`
  const basePrice = dbProduct?.price || dbProduct?.harga || 'Rp 80.000'
  const originalPrice = dbProduct?.original_price || dbProduct?.coret || ''
  
  const productImages = [
    dbProduct?.image || dbProduct?.gambar,
    dbProduct?.image_secondary
  ].filter(Boolean)

  const currentMainImage = productImages[activeImageIdx] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500'

  const getCurrentPrice = () => {
    if (dbProduct?.sizes_price && typeof dbProduct.sizes_price === 'object') {
      const priceForSize = dbProduct.sizes_price[selectedSize]
      if (priceForSize && priceForSize.trim() !== '') {
        return priceForSize
      }
    }
    return basePrice
  }

  const categoryName = (dbProduct?.category || dbProduct?.kategori || '').toLowerCase()
  const isCustom3DProduct = 
    categoryName.includes('custom kaos') || 
    categoryName.includes('custom oversized') || 
    categoryName.includes('custom hoodie') || 
    categoryName.includes('custom topi') ||
    categoryName === 'kaos' ||
    categoryName === 'oversized' ||
    categoryName === 'hoodie' ||
    categoryName === 'topi' ||
    (!dbProduct?.image && !dbProduct?.image_secondary)

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

  const compressImage = (base64Str: string, maxWidth = 600): Promise<string> => {
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
        ctx?.clearRect(0, 0, width, height)
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/png'))
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
        price: getCurrentPrice(),
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
        image: isCustom3DProduct ? (compressedFront || currentMainImage) : currentMainImage,
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

      showToast(`Berhasil menambahkan "${productTitle}" (Size ${selectedSize}) ke keranjang!`)
    } catch (err) {
      console.error('Gagal menyimpan ke keranjang:', err)
      showToast('Penyimpanan browser penuh. Coba bersihkan keranjang belanja Anda.')
    }
  }

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewerName.trim() || !reviewComment.trim() || !dbProduct) return

    setSubmittingReview(true)
    try {
      let uploadedImageUrl = null

      if (reviewImageFile) {
        const fileExt = reviewImageFile.name.split('.').pop() || 'jpg'
        const fileName = `review-${dbProduct.id}-${Date.now()}.${fileExt}`
        const { error: uploadErr } = await supabase.storage.from('designs').upload(fileName, reviewImageFile)
        if (uploadErr) throw uploadErr

        const { data: pub } = supabase.storage.from('designs').getPublicUrl(fileName)
        uploadedImageUrl = pub.publicUrl
      }

      const { data: newRev, error: revErr } = await supabase
        .from('product_reviews')
        .insert([{
          product_id: Number(dbProduct.id),
          name: reviewerName.trim(),
          rating: Number(reviewRating),
          comment: reviewComment.trim(),
          image_url: uploadedImageUrl
        }])
        .select()
        .single()

      if (revErr || !newRev) throw revErr

      const updatedReviews = [newRev as ProductReview, ...reviews]
      setReviews(updatedReviews)

      const totalRatingSum = updatedReviews.reduce((acc, r) => acc + r.rating, 0)
      const newAverageRating = Number((totalRatingSum / updatedReviews.length).toFixed(1))

      await supabase
        .from('products')
        .update({ rating: newAverageRating })
        .eq('id', dbProduct.id)

      setDbProduct({ ...dbProduct, rating: newAverageRating })

      setReviewerName('')
      setReviewComment('')
      setReviewRating(5)
      setReviewImageFile(null)
      alert('Ulasan dan foto berhasil dikirim! Terima kasih.')
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim ulasan.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loadingDb) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-xs font-bold">
        Memuat Produk...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white py-6 px-3 sm:px-6 md:px-10 selection:bg-white selection:text-black relative">
      
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[99999] bg-zinc-900 border border-zinc-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <p className="text-xs font-bold tracking-wide">{toastMessage}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-white">Beranda</Link> / <Link href="/products" className="hover:text-white">Katalog</Link> / <span className="text-zinc-300 font-bold">{productTitle}</span>
        </div>

        {!isCustom3DProduct ? (
          <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8 items-start">
            
            <div className="w-full md:col-span-5 space-y-3 flex-shrink-0">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl p-2.5 md:p-4 shadow-2xl overflow-hidden aspect-square flex items-center justify-center relative">
                <img src={currentMainImage} alt={productTitle} className="w-full h-full object-cover rounded-xl md:rounded-2xl" />
                <span className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {dbProduct?.category || 'Apparel Series'}
                </span>
              </div>
              {productImages.length > 1 && (
                <div className="flex gap-2">
                  {productImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition cursor-pointer bg-zinc-900 ${activeImageIdx === idx ? 'border-white' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:col-span-7 bg-zinc-900 border border-zinc-800 p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl space-y-4 md:space-y-6">
              <div className="space-y-1.5 border-b border-zinc-800 pb-3">
                <h1 className="text-lg md:text-3xl font-black uppercase tracking-tight text-white">
                  {productTitle}
                </h1>
                <div className="flex items-baseline gap-3 pt-0.5">
                  <span className="text-xl md:text-2xl font-black text-red-500">{getCurrentPrice()}</span>
                  {originalPrice && <span className="text-xs text-zinc-500 line-through font-semibold">{originalPrice}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-white font-black">{dbProduct?.rating || 4.9}</span>
                  <span className="text-zinc-500">({reviews.length})</span>
                </div>
                <span>•</span>
                <span>Terjual {dbProduct?.sold_count || 25}+</span>
              </div>

              {dbProduct?.description && (
                <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                  <p className="font-bold text-zinc-300 mb-1 uppercase text-[10px]">Deskripsi Produk:</p>
                  {dbProduct.description}
                </div>
              )}

              {dbProduct?.colors && Array.isArray(dbProduct.colors) && dbProduct.colors.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase">
                    Warna: <span className="text-zinc-500 font-normal">{selectedColor}</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {dbProduct.colors.map((hex: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(hex)}
                        className={`w-7 h-7 rounded-full border-2 transition cursor-pointer shadow-sm ${selectedColor === hex ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110 border-white' : 'border-zinc-700'}`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase">Size / Ukuran</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition border cursor-pointer ${
                        selectedSize === size ? 'bg-white text-black border-white shadow' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-800 rounded-xl w-28 overflow-hidden bg-zinc-950">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white transition">−</button>
                    <span className="flex-1 text-center text-xs font-black">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white transition">+</button>
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">Stok Tersedia</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 rounded-2xl uppercase tracking-widest text-xs transition shadow-xl cursor-pointer"
                >
                  ADD TO CART
                </button>

                <ShareButton productTitle={productTitle} />
              </div>
            </div>

          </div>
        ) : (
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
                  <span className="text-xl font-black text-red-500">{getCurrentPrice()}</span>
                  {originalPrice && <span className="text-xs text-zinc-500 line-through font-semibold">{originalPrice}</span>}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-white font-black">{dbProduct?.rating || 4.9}</span>
                  <span className="text-zinc-500">({reviews.length} Ulasan)</span>
                </div>
                <span>•</span>
                <span>Terjual {dbProduct?.sold_count || 25}+</span>
              </div>

              {dbProduct?.description && (
                <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <p className="font-bold text-zinc-300 mb-1 uppercase text-[10px]">Deskripsi Produk:</p>
                  {dbProduct.description}
                </div>
              )}

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
                <div className="flex items-center gap-3 flex-wrap">
                  {dbProduct?.colors && Array.isArray(dbProduct.colors) && dbProduct.colors.length > 0 ? (
                    dbProduct.colors.map((hex: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(hex)}
                        className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${selectedColor === hex ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110 border-white' : 'border-zinc-700'}`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">Warna standar putih/hitam</span>
                  )}
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

                <ShareButton productTitle={productTitle} />
              </div>
            </div>
          </div>
        )}

        {/* ULASAN & FOTO PEMBELI + RESPON ADMIN */}
        <div className="border-t border-zinc-800 pt-12 space-y-8">
          <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-white">
            Ulasan & Foto Pembeli ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {reviews.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">Belum ada ulasan untuk produk ini. Jadilah yang pertama mengulas!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-white">{rev.name}</span>
                      <span className="text-[10px] text-zinc-500">{new Date(rev.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="text-yellow-500 text-xs">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className="text-xs text-zinc-300">{rev.comment}</p>
                    
                    {rev.image_url && (
                      <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img src={rev.image_url} alt="Bukti Foto" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* 🔥 RESPON PENJUAL / ADMIN */}
                    {rev.admin_reply && (
                      <div className="mt-3 bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-1">
                        <p className="font-black text-[10px] text-red-500 uppercase">Admin DSCPL Wear:</p>
                        <p className="text-xs text-zinc-300">{rev.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddReview} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase">Tulis Ulasan & Kirim Foto Hasil Jadi</h3>
              
              <div>
                <label className="block font-bold mb-1 text-zinc-300">Nama Anda *</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 font-medium text-white focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-zinc-300">Rating Bintang *</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value={5}>★★★★★ (Sangat Puas)</option>
                  <option value={4}>★★★★☆ (Puas)</option>
                  <option value={3}>★★★☆☆ (Cukup)</option>
                  <option value={2}>★★☆☆☆ (Kurang)</option>
                  <option value={1}>★☆☆☆☆ (Sangat Buruk)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-zinc-300">Komentar / Pengalaman *</label>
                <textarea
                  rows={3}
                  placeholder="Kualitas sablon dan bahannya mantap banget..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 font-medium text-white focus:outline-none resize-none focus:border-white"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-bold mb-1 text-zinc-300">Upload Foto Produk (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReviewImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs font-semibold text-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-black cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow"
              >
                {submittingReview ? 'Mengirim Ulasan...' : 'Kirim Ulasan & Foto'}
              </button>
            </form>

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