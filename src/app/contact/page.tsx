'use client'

import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-6">
        <span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          DSCPL WEAR SUPPORT
        </span>
        <h1 className="text-3xl font-black text-black">Hubungi Kami</h1>
        <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
          Punya pertanyaan seputar custom apparel, sablon DTF, atau kendala pesanan? Silakan hubungi tim workshop kami langsung melalui WhatsApp resmi.
        </p>
        
        <div className="pt-4">
          <a
            href="https://wa.me/6281234567890?text=Halo%20DSCPL%20WEAR,%20saya%20ingin%20konsultasi%20custom%20apparel."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition shadow cursor-pointer"
          >
            Chat WhatsApp Workshop 💬
          </a>
        </div>

        <div className="pt-6 border-t border-gray-100 text-xs text-gray-400 font-semibold">
          <p>📍 Depok, West Java, Indonesia</p>
        </div>

        <div className="pt-2">
          <Link href="/" className="text-xs font-bold text-gray-600 hover:text-black">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}