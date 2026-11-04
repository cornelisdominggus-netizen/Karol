'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Order = {
  id: number
  customer_name: string
  phone: string
  address: string
  items: string
  total_price: string | null
  status: string
  created_at: string
}

function OrderDetailContent() {
  const router = useRouter()
  const params = useParams()
  const rawId = params?.id
  const orderId = Array.isArray(rawId) ? rawId[0] : rawId

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        router.replace('/admin/login')
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle()

      if (error) {
        console.error('Gagal memuat pesanan', error.message)
      }
      if (data) setOrder(data as Order)
      setLoading(false)
    }

    init()
  }, [orderId, router])

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
    if (error) {
      alert('Gagal memperbarui status pesanan.')
      return
    }
    setOrder({ ...order, status: newStatus })
    alert('Status pesanan berhasil diperbarui!')
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-bold text-black">Memuat detail pesanan...</div>
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 py-10 px-4 text-center">
        <h1 className="text-lg font-black text-black">Pesanan tidak ditemukan.</h1>
        <Link href="/admin/orders" className="text-xs text-blue-600 underline mt-3 inline-block">← Kembali ke Daftar Pesanan</Link>
      </main>
    )
  }

  const waMessage = encodeURIComponent(
    `Halo Kak *${order.customer_name}*, terima kasih sudah memesan di *DSCPL WEAR*!\n\n` +
    `Berikut adalah detail pesanan Anda (ID: #${order.id}):\n` +
    `- Item: ${order.items || 'Custom Apparel'}\n` +
    `- Total: ${order.total_price || 'Rp 0'}\n` +
    `- Status: *${order.status || 'Pending'}*\n\n` +
    `Pesanan Anda sedang kami proses ya Kak. Silakan kabari jika ada catatan tambahan!`
  )

  const cleanPhone = order.phone ? order.phone.replace(/^0/, '62').replace(/[^0-9]/g, '') : ''

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div>
            <Link href="/admin/orders" className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider block mb-1">
              ← Kembali ke Daftar Pesanan
            </Link>
            <h1 className="text-2xl font-black text-black">Detail Pesanan #{order.id}</h1>
            <p className="text-[11px] text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('id-ID')}</p>
          </div>
          <span className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl">
            {order.status || 'Pending'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b pb-2">Informasi Pembeli</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-500 block">Nama Lengkap</span>
                <span className="font-bold text-black text-sm">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block">No. WhatsApp</span>
                <span className="font-bold text-black text-sm">{order.phone}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Alamat Pengiriman</span>
                <span className="font-semibold text-black leading-relaxed block">{order.address}</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Hubungi Pelanggan</h2>
              {cleanPhone ? (
                <a
                  href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition uppercase tracking-wider shadow-sm cursor-pointer text-center"
                >
                  💬 Kirim Konfirmasi via WhatsApp
                </a>
              ) : (
                <p className="text-xs text-red-500">Nomor WhatsApp tidak valid.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4 h-fit">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b pb-2">Rincian Transaksi</h2>
            
            <div className="space-y-2 text-xs">
              <span className="text-gray-500 block">Produk Dipesan</span>
              <p className="font-bold text-black bg-gray-50 p-3 rounded-xl border border-gray-100">{order.items}</p>
            </div>

            <div className="space-y-1 text-xs pt-2">
              <span className="text-gray-500 block">Total Pembayaran</span>
              <span className="text-lg font-black text-red-600">{order.total_price || 'Rp 0'}</span>
            </div>

            <div className="pt-4 border-t space-y-2">
              <label className="block text-xs font-bold text-black uppercase">Ubah Status Pesanan</label>
              <select
                value={order.status || 'Pending'}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-xs font-bold text-black rounded-xl p-3 focus:ring-2 focus:ring-black focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Diproses">Sedang Diproses</option>
                <option value="Dikirim">Dikirim</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-bold text-black">Memuat halaman...</div>}>
      <OrderDetailContent />
    </Suspense>
  )
}
