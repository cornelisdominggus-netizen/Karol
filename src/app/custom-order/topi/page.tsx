'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CustomTopiPage() {
  const [sortBy, setSortBy] = useState('latest')

  // Daftar produk topi spesifik sesuai referensi kreasy.id
  const topiProducts = [
    {
      id: 1,
      title: 'Custom Topi Trucker Jaring',
      originalPrice: 'Rp 49.876',
      promoPrice: 'Rp 24.689',
      discount: '-50%',
      rating: 5,
      reviews: 12,
      badge: 'PROMO'
    },
    {
      id: 2,
      title: 'Custom Topi Snapback Klasik',
      originalPrice: 'Rp 69.825',
      promoPrice: 'Rp 35.000',
      discount: '-50%',
      rating: 5,
      reviews: 12,
      badge: 'PROMO'
    },
    {
      id: 3,
      title: 'Custom Topi Snapback Modern',
      originalPrice: 'Rp 69.825',
      promoPrice: 'Rp 69.127',
      discount: '-50%',
      rating: 5,
      reviews: 12,
      badge: 'PROMO'
    },
    {
      id: 4,
      title: 'Custom Topi Snapback 5 Panel',
      originalPrice: 'Rp 69.825',
      promoPrice: 'Rp 35.000',
      discount: '-50%',
      rating: 5,
      reviews: 13,
      badge: 'PROMO'
    },
    {
      id: 5,
      title: 'Custom Topi Bucket Hat Polos / Sablon',
      originalPrice: 'Rp 75.000',
      promoPrice: 'Rp 37.500',
      discount: '-50%',
      rating: 5,
      reviews: 9,
      badge: 'PROMO'
    }
  ]

  return (
    <main className="min-h-screen bg-white text-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-black">Beranda</Link> / <Link href="/custom-order" className="hover:text-black">Produk Custom</Link> / <span className="text-black font-bold">Custom Topi</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR KIRI: Kategori Produk */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-black text-black text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
                Kategori Produk
              </h3>
              <ul className="space-y-2.5 text-xs font-semibold text-gray-700">
                <li><Link href="/downloads" className="hover:text-black transition block">Download</Link></li>
                <li><Link href="/products?category=alat-bahan-dtf" className="hover:text-black transition block">Dtf & Tools</Link></li>
                <li><Link href="/products?category=lainnya" className="hover:text-black transition block">Lainnya</Link></li>
                <li><Link href="/products?category=polosan" className="hover:text-black transition block">Polosan</Link></li>
                <li className="pt-2">
                  <span className="text-black font-bold block mb-2 uppercase text-[11px]">Produk Custom</span>
                  <ul className="pl-3 space-y-2 border-l-2 border-gray-300">
                    <li><Link href="/custom-order?type=hoodie" className="hover:text-black transition block">Custom Hoodie</Link></li>
                    <li><Link href="/custom-order?type=kaos" className="hover:text-black transition block">Custom Kaos</Link></li>
                    <li><Link href="/custom-order?type=merchandise" className="hover:text-black transition block">Custom Merchandise</Link></li>
                    <li><Link href="/custom-order?type=tas" className="hover:text-black transition block">Custom Tas</Link></li>
                    <li><Link href="/custom-order/topi" className="text-black font-bold transition block">Custom Topi</Link></li>
                  </ul>
                </li>
              </ul>
            </div>
          </aside>

          {/* KONTEN UTAMA KANAN: Grid Topi */}
          <div className="lg:col-span-3">
            
            {/* Header & Sorting Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-6 gap-4">
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">Custom Topi</h1>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-bold text-gray-600">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-xs font-bold text-black rounded-xl px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                >
                  <option value="latest">Menurut yang terbaru</option>
                  <option value="price-low">Harga: Rendah ke Tinggi</option>
                  <option value="price-high">Harga: Tinggi ke Rendah</option>
                </select>
              </div>
            </div>

            {/* Grid Kartu Produk Topi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {topiProducts.map((topi) => (
                <div 
                  key={topi.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-black transition group relative"
                >
                  <div>
                    {/* Badge Diskon -50% */}
                    <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-gray-200">
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                        {topi.discount}
                      </span>
                      <div className="text-center p-4">
                        <span className="text-3xl block mb-1">🧢</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">KREASY TOPI</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Custom Topi</span>
                    <h3 className="font-bold text-black text-sm mt-1 group-hover:underline line-clamp-2">
                      {topi.title}
                    </h3>

                    {/* Rating Bintang */}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-500 text-xs">★★★★★</span>
                      <span className="text-[11px] text-gray-500 font-medium">({topi.reviews})</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400 line-through block">{topi.originalPrice}</span>
                      <span className="font-black text-red-600 text-sm">{topi.promoPrice}</span>
                    </div>
                    <button
                      onClick={() => alert(`Memilih pesanan: ${topi.title}`)}
                      className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
                    >
                      Pesan
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}