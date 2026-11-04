'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function CustomOrderContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') || 'kaos'
  const [sortBy, setSortBy] = useState('latest')

  const topiProducts = [
    { id: 'topi-trucker', title: 'Custom Topi Trucker Jaring', originalPrice: 'Rp 49.876', promoPrice: 'Rp 24.689', discount: '-50%', rating: 5, reviews: 12 },
    { id: 'topi-snapback-klasik', title: 'Custom Topi Snapback Klasik', originalPrice: 'Rp 69.825', promoPrice: 'Rp 35.000', discount: '-50%', rating: 5, reviews: 12 },
    { id: 'topi-snapback-modern', title: 'Custom Topi Snapback Modern', originalPrice: 'Rp 69.825', promoPrice: 'Rp 69.127', discount: '-50%', rating: 5, reviews: 12 },
    { id: 'topi-snapback-5panel', title: 'Custom Topi Snapback 5 Panel', originalPrice: 'Rp 69.825', promoPrice: 'Rp 35.000', discount: '-50%', rating: 5, reviews: 13 },
    { id: 'topi-bucket', title: 'Custom Topi Bucket Hat Polos / Sablon', originalPrice: 'Rp 75.000', promoPrice: 'Rp 37.500', discount: '-50%', rating: 5, reviews: 9 }
  ]

  const hoodieProducts = [
    { id: 'hoodie-hitam', title: 'Custom Hoodie Fleece Premium Hitam', originalPrice: 'Rp 220.000', promoPrice: 'Rp 110.000', discount: '-50%', rating: 5, reviews: 19 },
    { id: 'hoodie-zipper', title: 'Custom Hoodie Zipper Resleting Tebal', originalPrice: 'Rp 240.000', promoPrice: 'Rp 120.000', discount: '-50%', rating: 5, reviews: 15 },
    { id: 'crewneck', title: 'Custom Crewneck Sweatshirt Polos', originalPrice: 'Rp 180.000', promoPrice: 'Rp 90.000', discount: '-50%', rating: 5, reviews: 8 }
  ]

  const merchandiseProducts = [
    { id: 'mug-keramik', title: 'Custom Mug / Cangkir Keramik Sablon Full Color', originalPrice: 'Rp 50.000', promoPrice: 'Rp 25.000', discount: '-50%', rating: 5, reviews: 24 },
    { id: 'tumbler-led', title: 'Custom Tumbler Stainless Termos LED', originalPrice: 'Rp 120.000', promoPrice: 'Rp 60.000', discount: '-50%', rating: 5, reviews: 31 },
    { id: 'gantungan-kunci', title: 'Custom Gantungan Kunci Akrilik UV Print', originalPrice: 'Rp 25.000', promoPrice: 'Rp 12.500', discount: '-50%', rating: 5, reviews: 40 },
    { id: 'lanyard', title: 'Custom Lanyard / Tali ID Card Printing', originalPrice: 'Rp 35.000', promoPrice: 'Rp 17.500', discount: '-50%', rating: 5, reviews: 22 }
  ]

  const tasProducts = [
    { id: 'tote-bag', title: 'Custom Tote Bag Kanvas Resleting', originalPrice: 'Rp 60.000', promoPrice: 'Rp 30.000', discount: '-50%', rating: 5, reviews: 18 },
    { id: 'drawstring-bag', title: 'Custom Drawstring Bag / Tas Serut Parasut', originalPrice: 'Rp 45.000', promoPrice: 'Rp 22.500', discount: '-50%', rating: 5, reviews: 14 },
    { id: 'goodie-bag', title: 'Custom Goodie Bag Spunbond Event', originalPrice: 'Rp 15.000', promoPrice: 'Rp 7.500', discount: '-50%', rating: 5, reviews: 27 }
  ]

  const kaosProducts = [
    { id: 'kaos-oversize', title: 'Custom Kaos Lengan Pendek Oversize', originalPrice: 'Rp 180.000', promoPrice: 'Rp 90.000', discount: '-50%', rating: 5, reviews: 4 },
    { id: 'kaos-panjang', title: 'Custom Kaos Lengan Panjang Dewasa 30s', originalPrice: 'Rp 150.000', promoPrice: 'Rp 75.000', discount: '-50%', rating: 5, reviews: 12 },
    { id: 'kaos-anak-dewasa', title: 'Custom Kaos Lengan Pendek Anak & Dewasa 30s', originalPrice: 'Rp 100.000', promoPrice: 'Rp 50.000', discount: '-50%', rating: 5, reviews: 8 },
    { id: 'kaos-24s', title: 'Custom Kaos Lengan Pendek Dewasa 24s', originalPrice: 'Rp 150.000', promoPrice: 'Rp 75.000', discount: '-50%', rating: 5, reviews: 16 }
  ]

  let displayedProducts = kaosProducts
  let categoryTitle = 'Custom Kaos'
  let emojiIcon = '👕'

  if (typeParam === 'topi') {
    displayedProducts = topiProducts
    categoryTitle = 'Custom Topi'
    emojiIcon = '🧢'
  } else if (typeParam === 'hoodie') {
    displayedProducts = hoodieProducts
    categoryTitle = 'Custom Hoodie'
    emojiIcon = '🧥'
  } else if (typeParam === 'merchandise') {
    displayedProducts = merchandiseProducts
    categoryTitle = 'Custom Merchandise'
    emojiIcon = '🎁'
  } else if (typeParam === 'tas') {
    displayedProducts = tasProducts
    categoryTitle = 'Custom Tas'
    emojiIcon = '👜'
  }

  return (
    <main className="min-h-screen bg-white text-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-black">Beranda</Link> / <span className="text-gray-400">Produk Custom</span> / <span className="text-black font-bold uppercase">{typeParam}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-black text-black text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-200">
                Kategori Produk
              </h3>
              <ul className="space-y-2.5 text-xs font-semibold text-gray-700">
                <li><Link href="/downloads" className="hover:text-black transition block">Download</Link></li>
                <li><Link href="/products?category=alat-bahan-dtf" className="hover:text-black transition block">Dtf & Tools</Link></li>
                <li><Link href="/products/polosan" className="hover:text-black transition block">Polosan</Link></li>
                <li className="pt-2">
                  <span className="text-black font-bold block mb-2 uppercase text-[11px]">Produk Custom</span>
                  <ul className="pl-3 space-y-2 border-l-2 border-gray-300">
                    <li><Link href="/custom-order?type=hoodie" className={`block transition ${typeParam === 'hoodie' ? 'text-black font-bold' : 'hover:text-black'}`}>Custom Hoodie</Link></li>
                    <li><Link href="/custom-order?type=kaos" className={`block transition ${typeParam === 'kaos' ? 'text-black font-bold' : 'hover:text-black'}`}>Custom Kaos</Link></li>
                    <li><Link href="/custom-order?type=merchandise" className={`block transition ${typeParam === 'merchandise' ? 'text-black font-bold' : 'hover:text-black'}`}>Custom Merchandise</Link></li>
                    <li><Link href="/custom-order?type=tas" className={`block transition ${typeParam === 'tas' ? 'text-black font-bold' : 'hover:text-black'}`}>Custom Tas</Link></li>
                    <li><Link href="/custom-order?type=topi" className={`block transition ${typeParam === 'topi' ? 'text-black font-bold' : 'hover:text-black'}`}>Custom Topi</Link></li>
                  </ul>
                </li>
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-6 gap-4">
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">{categoryTitle}</h1>
              
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {displayedProducts.map((item: any) => (
                <div 
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-black transition group"
                >
                  <div>
                    <Link href={`/products/${item.id}`} className="block">
                      <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-gray-200 group-hover:bg-gray-200 transition">
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                          {item.discount}
                        </span>
                        <div className="text-center p-4">
                          <span className="text-3xl block mb-1">{emojiIcon}</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">QUICK VIEW</span>
                        </div>
                      </div>
                    </Link>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{categoryTitle}</span>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="font-bold text-black text-sm mt-1 group-hover:underline line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

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

export default function CustomOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white text-black flex items-center justify-center text-xs font-bold">Memuat produk custom...</div>}>
      <CustomOrderContent />
    </Suspense>
  )
}