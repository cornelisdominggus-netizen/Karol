'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ApparelType = 'kaos' | 'oversized' | 'hoodie' | 'topi'

export default function CustomMockupPage() {
  const router = useRouter()
  
  const [selectedType, setSelectedType] = useState<ApparelType>('kaos')
  const [selectedColor, setSelectedColor] = useState<'black' | 'white' | 'gray' | 'navy'>('black')
  const [designImage, setDesignImage] = useState<string | null>(null)
  const [designName, setDesignName] = useState<string>('')
  const [size, setSize] = useState<string>('L')
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDesignName(file.name)
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setDesignImage(uploadEvent.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const prices: Record<ApparelType, number> = {
    kaos: 95000,
    oversized: 120000,
    hoodie: 220000,
    topi: 75000,
  }

  const totalPrice = prices[selectedType] * quantity

  const handleAddToCart = () => {
    if (!designImage) {
      alert('Harap unggah file desain sablon terlebih dahulu!')
      return
    }

    setLoading(true)

    const newItem = {
      id: Date.now(),
      title: `Custom ${selectedType.toUpperCase()} (${selectedColor.toUpperCase()})`,
      price: 'Rp ' + totalPrice.toLocaleString('id-ID'),
      size: size,
      quantity: quantity,
      image: designImage,
    }

    const existingCart = JSON.parse(localStorage.getItem('dscpl_cart') || '[]')
    localStorage.setItem('dscpl_cart', JSON.stringify([...existingCart, newItem]))
    window.dispatchEvent(new Event('dscpl_cart_updated'))

    alert('Desain & Produk berhasil dimasukkan ke keranjang!')
    router.push('/checkout')
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black selection:bg-black selection:text-white pb-20">
      
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-black tracking-tighter text-lg uppercase">
          DSCPL<span className="text-red-600">.</span>WEAR <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full ml-2">STUDIO MOCKUP</span>
        </Link>
        <Link href="/products" className="text-xs font-bold uppercase tracking-wider hover:underline">
          ← Kembali ke Katalog
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center relative min-h-[480px]">
          <span className="absolute top-4 left-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Live Preview Studio
          </span>

          <div className="relative w-72 h-80 md:w-96 md:h-96 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner ${
              selectedColor === 'black' ? 'bg-zinc-900 text-white' :
              selectedColor === 'white' ? 'bg-zinc-100 text-black border border-gray-300' :
              selectedColor === 'gray' ? 'bg-zinc-400 text-white' : 'bg-blue-950 text-white'
            }`}>
              
              <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center opacity-30">
                <span className="text-xs uppercase font-black tracking-widest">{selectedType}</span>
              </div>

              {designImage ? (
                <div className="absolute z-10 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center p-2">
                  <img 
                    src={designImage} 
                    alt="Desain Sablon" 
                    className="max-w-full max-h-full object-contain drop-shadow-lg"
                  />
                </div>
              ) : (
                <div className="relative z-10 text-center p-6 space-y-1">
                  <span className="text-2xl">👕</span>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Belum ada desain diunggah</p>
                </div>
              )}

            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">
              Jenis: <span className="text-black font-black">{selectedType}</span> | Warna: <span className="text-black font-black">{selectedColor}</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-red-600">Konfigurasi Mockup</h2>
            <p className="text-xs text-gray-500 font-medium">Pilih model pakaian, warna, dan unggah file sablonmu.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider">1. Pilih Jenis Pakaian</label>
            <div className="grid grid-cols-2 gap-2">
              {(['kaos', 'oversized', 'hoodie', 'topi'] as ApparelType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`py-2.5 px-4 rounded-xl