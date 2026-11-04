'use client'

import Link from 'next/link'

export default function LocationPage() {
  return (
    <main className="min-h-screen bg-white text-black py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-black text-white p-8 rounded-3xl space-y-3 shadow">
          <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            WORKSHOP RESMI
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Lokasi DSCPL WEAR</h1>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            Pusat layanan custom apparel, sablon DTF berkualitas tinggi, dan penyediaan polosan standar distro di Depok. Tampil presisi dan berdisiplin tinggi bersama DSCPL WEAR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-4">
            <h2 className="text-sm font-black uppercase text-black border-b pb-2">Alamat Workshop</h2>
            <div className="text-xs space-y-2 text-gray-700 leading-relaxed font-medium">
              <p className="font-bold text-black text-sm">📍 Depok, West Java, Indonesia</p>
              <p>Melayani pemesanan online seluruh Indonesia dan pickup langsung ke workshop area Depok & sekitarnya.</p>
              <p className="pt-2 text-gray-500">Jam Operasional: Senin - Sabtu (09.00 - 21.00 WIB)</p>
            </div>
            <div className="pt-2">
              <Link
                href="https://wa.me/628123456789"
                target="_blank"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-3 rounded-xl transition hover:bg-gray-800"
              >
                💬 Hubungi Admin via WhatsApp
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-black uppercase text-black border-b pb-2">Layanan Utama</h2>
              <ul className="text-xs space-y-2 text-gray-700 mt-3 font-semibold">
                <li>• Custom Sablon DTF & Polyflex</li>
                <li>• Custom Kaos, Hoodie, Topi, & Tas</li>
                <li>• Penyediaan Kaos Polos Standar Distro</li>
                <li>• Produksi Merchandise Event & Komunitas</li>
              </ul>
            </div>
            <div>
              <Link
                href="/products"
                className="block text-center bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition shadow"
              >
                LIHAT KATALOG PRODUK →
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}