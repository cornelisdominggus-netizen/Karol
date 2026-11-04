'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PolosanPage() {
  const [sortBy, setSortBy] = useState('latest')
  const [activeSubCategory, setActiveSubCategory] = useState('kaos-polos')

  const polosanProducts = [
    {
      id: 'kaos-panjang-30s',
      title: 'Kaos Polos Dewasa Lengan Panjang 30s',
      originalPrice: 'Rp 43.255',
      promoPrice: 'Rp 42.822',
      rating: 5,
      reviews: 9,
      colors: ['#000000', '#ffffff', '#1e3a8a', '#b91c1c', '#047857', '#9ca3af'],
      badge: '30S'
    },
    {
      id: 'kaos-pendek-30s',
      title: 'Kaos Polos Dewasa Lengan Pendek 30s',
      originalPrice: 'Rp 35.870',
      promoPrice: 'Rp 35.511',
      rating: 5,
      reviews: 10,
      colors: ['#000000', '#ffffff', '#1e3a8a', '#b91c1c', '#1d4ed8', '#78716c'],
      badge: '30S'
    },
    {
      id: 'topi-polos-trucker',
      title: 'Topi Polos Trucker Jaring Premium',
      originalPrice: 'Rp 25.000',
      promoPrice: 'Rp 19.500',
      rating: 5,
      reviews: 14,
      colors: ['#000000', '#ffffff', '#b91c1c', '#1e3a8a'],
      badge: 'TOPI'
    },
    {
      id: 'kaos-oversize-24s',
      title: 'Kaos Polos Oversize Cotton Combed 24s',
      originalPrice: 'Rp 55.000',
      promoPrice: 'Rp 48.000',
      rating: 5,
      reviews: 6,
      colors: ['#000000', '#ffffff', '#374151', '#7c2d12'],
      badge: '24S'
    }
  ]

  return (
    <main className="min-h-screen bg-white text-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-black">Beranda</Link> / <span className="text-gray-400">Polosan</span> / <span className="text-black font-bold uppercase">Kaos Polos</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR KIRI */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-black text-black text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
                Kategori Produk
              </h3>
              <ul className="space-y-2.5 text-xs font-semibold text-gray-700">
                <li><Link href="/downloads" className="hover:text-black transition block">Download</Link></li>
                <li><Link href="/products?category=alat-bahan-dtf" className="hover:text-black transition block">Dtf & Tools</Link></li>
                <li><Link href="/products?category=lainnya" className="hover:text-black transition block">Lainnya</Link></li>
                <li className="pt-2">
                  <span className="text-black font-bold block mb-2 uppercase text-[11px]">Polosan</span>
                  <ul className="pl-3 space-y-2 border-l-2 border-gray-300">
                    <li>
                      <button 
                        onClick={() => setActiveSubCategory('kaos-polos')}
                        className={`block text-left transition ${activeSubCategory === 'kaos-polos' ? 'text-black font-bold' : 'text-gray-600 hover:text-black'}`}
                      >
                        Kaos Polos
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setActiveSubCategory('topi-polos')}
                        className={`block text-left transition ${activeSubCategory === 'topi-polos' ? 'text-black font-bold' : 'text-gray-600 hover:text-black'}`}
                      >
                        Topi Polos
                      </button>
                    </li>
                  </ul>
                </li>
                <li className="pt-2">
                  <span className="text-black font-bold block mb-2 uppercase text-[11px]">Produk Custom</span>
                  <ul className="pl-3 space-y-2 border-l-2 border-gray-300">
                    <li><Link href="/custom-order?type=hoodie" className="hover:text-black transition block">Custom Hoodie</Link></li>
                    <li><Link href="/custom-order?type=kaos" className="hover:text-black transition block">Custom Kaos</Link></li>
                    <li><Link href="/custom-order?type=merchandise" className="hover:text-black transition block">Custom Merchandise</Link></li>
                    <li><Link href="/custom-order?type=tas" className="hover:text-black transition block">Custom Tas</Link></li>
                    <li><Link href="/custom-order?type=topi" className="hover:text-black transition block">Custom Topi</Link></li>
                  </ul>
                </li>
              </ul>
            </div>
          </aside>

          {/* KONTEN UTAMA KANAN */}
          <div className="lg:col-span-3">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-6 gap-4">
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">Kaos Polos & Pakaian</h1>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-bold text-gray-600">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-xs font-bold text-black rounded-xl px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                >
                  <option value="latest">Urutkan menurut yang terbaru</option>
                  <option value="price-low">Harga: Rendah ke Tinggi</option>
                  <option value="price-high">Harga: Tinggi ke Rendah</option>
                </select>
              </div>
            </div>

            {/* Grid Kartu Produk (Bisa diklik menuju detail produk) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {polosanProducts.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-black transition group"
                >
                  <div>
                    {/* Link ke Detail Produk saat gambar diklik */}
                    <Link href={`/products/${item.id}`} className="block">
                      <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-gray-200 group-hover:bg-gray-200 transition">
                        <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.badge}
                        </span>
                        <div className="text-center p-4">
                          <span className="text-3xl block mb-1">👕</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">QUICK VIEW</span>
                        </div>
                      </div>
                    </Link>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Kaos Polos</span>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="font-bold text-black text-sm mt-1 group-hover:underline line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Indikator Warna */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {item.colors.map((color, idx) => (
                        <span 
                          key={idx} 
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Rating Bintang */}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-500 text-xs">★★★★★</span>
                      <span className="text-[11px] text-gray-500 font-medium">({item.reviews})</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400 line-through block">{item.originalPrice}</span>
                      <span className="font-black text-red-600 text-sm">{item.promoPrice}</span>
                    </div>
                    <Link
                      href={`/products/${item.id}`}
                      className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm inline-block"
                    >
                      Pesan
                    </Link>
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