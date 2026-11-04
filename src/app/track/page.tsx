'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TrackOrderPage() {
  const [keyword, setKeyword] = useState('')
  const [searchResult, setSearchResult] = useState<any[] | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return

    const savedOrders = JSON.parse(localStorage.getItem('dscpl_orders') || '[]')
    
    // Cari berdasarkan ID Pesanan atau Nomor WhatsApp Pelanggan secara real-time
    const matched = savedOrders.filter((ord: any) => 
      ord.id.toString().includes(keyword.trim()) || 
      ord.phone.includes(keyword.trim()) ||
      ord.customerName.toLowerCase().includes(keyword.trim().toLowerCase())
    )

    setSearchResult(matched)
    setHasSearched(true)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-black text-white p-8 rounded-3xl text-center space-y-3 shadow">
          <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            DSCPL WEAR TRACKING SYSTEM
          </span>
          <h1 className="text-2xl md:text-3xl font-black">Cek Status Pesanan Real-Time 📦</h1>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Masukkan Nomor Pesanan (ID) atau Nomor WhatsApp Anda untuk memantau progres pengerjaan custom apparel di workshop kami.
          </p>
        </div>

        {/* Form Pencarian */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Contoh: 1730712345678 atau 0812345..."
              className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl p-3.5 text-xs font-bold text-black focus:outline-none placeholder:text-gray-400"
              required
            />
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow"
            >
              Cari Status 🔍
            </button>
          </form>
        </div>

        {/* Hasil Pencarian Real-Time */}
        {hasSearched && (
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Hasil Pencarian ({searchResult?.length || 0})
            </h2>

            {searchResult && searchResult.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                <span className="text-4xl">🔍</span>
                <h3 className="font-bold text-black text-sm">Pesanan tidak ditemukan.</h3>
                <p className="text-xs text-gray-500">Pastikan nomor ID pesanan atau WhatsApp yang Anda masukkan sudah benar.</p>
              </div>
            ) : (
              searchResult?.map((ord) => (
                <div key={ord.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
                    <div>
                      <span className="font-mono text-xs text-gray-400">ID: #{ord.id}</span>
                      <h3 className="font-black text-sm text-black">{ord.customerName}</h3>
                    </div>
                    <div>
                      {/* Badge Status Real-Time */}
                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        ord.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                        ord.status === 'Diproses' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        Status: {ord.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-gray-400 font-bold">Detail Item & File Desain:</p>
                      <p className="font-semibold text-black">{ord.items}</p>
                      {ord.designFiles && <p className="text-blue-600 text-[11px]">📁 {ord.designFiles}</p>}
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <p className="text-gray-400 font-bold">Total Pembayaran:</p>
                      <p className="font-black text-red-600 text-sm">{ord.totalPrice}</p>
                      <p className="text-[10px] text-gray-400">{new Date(ord.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-600">
                    {ord.status === 'Pending' && '⏳ Pesanan Anda sedang menunggu verifikasi pembayaran & file desain oleh admin.'}
                    {ord.status === 'Diproses' && '⚙️ Pesanan Anda sedang dalam tahap cetak sablon / produksi di workshop Depok.'}
                    {ord.status === 'Selesai' && '🎉 Pesanan Anda telah selesai diproduksi dan siap dikirim / diambil!'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/" className="text-xs font-bold text-gray-500 hover:text-black transition">
            ← Kembali ke Beranda Toko
          </Link>
        </div>

      </div>
    </main>
  )
}