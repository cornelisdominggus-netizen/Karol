'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function TrackOrderPage() {
  const [keyword, setKeyword] = useState('')
  const [searchResult, setSearchResult] = useState<any[] | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return

    setLoading(true)
    const query = keyword.trim()

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`phone.ilike.%${query}%,customer_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching orders:', error)
      setSearchResult([])
    } else {
      setSearchResult(data || [])
    }

    setHasSearched(true)
    setLoading(false)
  }

  useEffect(() => {
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (searchResult && searchResult.length > 0) {
            setSearchResult((prev) =>
              prev?.map((ord) => (ord.id === payload.new.id ? payload.new : ord)) || []
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [searchResult])

  const parseOrderItems = (itemsData: any) => {
    if (Array.isArray(itemsData)) return itemsData
    try {
      const parsed = JSON.parse(itemsData)
      if (Array.isArray(parsed)) return parsed
    } catch (e) {
      // ignore
    }
    return null
  }

  return (
    <main className="min-h-screen bg-white text-black py-12 px-4 sm:px-6 md:px-8 selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Elegan Minimalis Putih */}
        <div className="bg-gray-50 border border-gray-200 p-8 sm:p-10 rounded-3xl text-center space-y-4 shadow-sm relative overflow-hidden">
          <span className="bg-black text-white text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
            DSCPL WEAR TRACKING SYSTEM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Cek Status Pesanan Real-Time 📦</h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Masukkan Nomor WhatsApp atau Nama lengkap Anda untuk memantau progres pengerjaan custom apparel secara eksklusif di workshop kami.
          </p>
        </div>

        {/* Form Pencarian */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Contoh: 08123456789 atau Nama Anda"
              className="flex-1 bg-white border border-gray-300 rounded-2xl px-4 py-3.5 text-xs font-bold text-black focus:outline-none focus:border-black transition placeholder:text-gray-400 shadow-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow active:scale-95"
            >
              {loading ? 'Mencari...' : 'Cari Status 🔍'}
            </button>
          </form>
        </div>

        {/* Hasil Pencarian Real-Time */}
        {hasSearched && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 px-2">
              Hasil Pencarian ({searchResult?.length || 0})
            </h2>

            {searchResult && searchResult.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                <span className="text-4xl">🔍</span>
                <h3 className="font-bold text-black text-sm uppercase tracking-wider">Pesanan Tidak Ditemukan</h3>
                <p className="text-xs text-gray-500">Pastikan nomor WhatsApp atau nama yang Anda masukkan sudah sesuai dengan saat pemesanan.</p>
              </div>
            ) : (
              searchResult?.map((ord) => {
                const parsedItems = parseOrderItems(ord.items)
                return (
                  <div key={ord.id} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    
                    {/* Header Kartu Pesanan */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-3">
                      <div>
                        <span className="font-mono text-[11px] text-gray-400 font-bold">ORDER ID: #{ord.id}</span>
                        <h3 className="font-black text-base text-black uppercase tracking-wide">{ord.customer_name}</h3>
                      </div>
                      <div>
                        <span className={`text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider ${
                          ord.status === 'Selesai' ? 'bg-green-100 text-green-800 border border-green-200' :
                          ord.status === 'Dikirim' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          ord.status === 'Diproses' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          ● {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Detail Item & Desain */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rincian Item Pesanan:</p>
                      
                      {parsedItems ? (
                        <div className="space-y-3">
                          {parsedItems.map((item: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <div 
                                    className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 p-1 bg-white"
                                    style={{
                                      backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                                      backgroundSize: '8px 8px'
                                    }}
                                  >
                                    <img src={item.image} alt="" className="w-full h-full object-contain" />
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <p className="font-bold text-xs text-black uppercase">{item.title}</p>
                                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                    <span>Size: <strong className="text-red-600">{item.size}</strong></span>
                                    <span>•</span>
                                    <span>Qty: <strong>{item.quantity}</strong></span>
                                    {item.color && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          Warna: <span className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block shadow-inner" style={{ backgroundColor: item.color }} />
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className="text-xs font-black text-red-600 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                                {item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-700">
                          {String(ord.items)}
                        </div>
                      )}
                    </div>

                    {/* Informasi Pengiriman & Total */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-100">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Alamat Pengiriman:</span>
                        <p className="font-medium text-gray-700 leading-relaxed">📍 {ord.address}</p>
                        <p className="text-gray-500 text-[11px]">No. WhatsApp: {ord.phone}</p>
                      </div>

                      <div className="space-y-1 sm:text-right flex flex-col justify-end">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Pembayaran:</span>
                        <p className="font-black text-red-600 text-lg tracking-tight">{ord.total_price}</p>
                        <p className="text-[10px] text-gray-400 font-mono">Dibuat: {new Date(ord.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    {/* Status Banner */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-700 font-medium flex items-center gap-3">
                      <span className="text-lg">
                        {ord.status === 'Pending' ? '⏳' : ord.status === 'Diproses' ? '⚙️' : ord.status === 'Dikirim' ? '📦' : '🎉'}
                      </span>
                      <span>
                        {ord.status === 'Pending' && 'Pesanan Anda sedang menunggu verifikasi pembayaran & file desain oleh admin workshop.'}
                        {ord.status === 'Diproses' && 'Pesanan Anda sedang dalam tahap cetak sablon / produksi eksklusif di workshop Depok.'}
                        {ord.status === 'Dikirim' && 'Pesanan Anda telah selesai dan sedang dalam perjalanan pengiriman ekspedisi ke alamat tujuan!'}
                        {ord.status === 'Selesai' && 'Pesanan Anda telah selesai dan diterima dengan baik. Terima kasih telah mempercayakan apparel Anda di DSCPL WEAR!'}
                      </span>
                    </div>

                  </div>
                )
              })
            )}
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/" className="text-xs font-bold text-gray-400 hover:text-black transition tracking-wider uppercase">
            ← Kembali ke Beranda Toko
          </Link>
        </div>

      </div>
    </main>
  )
}