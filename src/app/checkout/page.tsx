'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [province, setProvince] = useState('Jawa Barat')
  const [city, setCity] = useState('Depok')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // State untuk 4 berkas terpisah
  const [designFront, setDesignFront] = useState<File | null>(null)
  const [designBack, setDesignBack] = useState<File | null>(null)
  const [mockupFront, setMockupFront] = useState<File | null>(null)
  const [mockupBack, setMockupBack] = useState<File | null>(null)

  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadCart = () => {
      const saved = localStorage.getItem('dscpl_cart')
      if (saved) {
        try { setCart(JSON.parse(saved)) } catch (e) { setCart([]) }
      }
    }
    loadCart()
    window.addEventListener('dscpl_cart_updated', loadCart)
    return () => window.removeEventListener('dscpl_cart_updated', loadCart)
  }, [])

  const handleQuantityChange = (cartId: number, delta: number) => {
    const updated = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    setCart(updated)
    localStorage.setItem('dscpl_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('dscpl_cart_updated'))
  }

  const handleRemoveItem = (cartId: number) => {
    const updated = cart.filter(item => item.cartId !== cartId)
    setCart(updated)
    localStorage.setItem('dscpl_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('dscpl_cart_updated'))
  }

  const subtotalNum = cart.reduce((acc, item) => {
    const p = parseInt(item.price.replace(/[^0-9]/g, '')) || 0
    return acc + (p * (item.quantity || 1))
  }, 0)

  const shippingCost = cart.length > 0 ? 15000 : 0
  const totalNum = subtotalNum + shippingCost

  // Helper untuk upload file ke Supabase Storage
  const uploadToStorage = async (file: File | null, folderPrefix: string) => {
    if (!file) return 'Tidak ada'
    const ext = file.name.split('.').pop()
    const fileName = `${folderPrefix}_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
    
    const { error } = await supabase.storage.from('designs').upload(fileName, file)
    if (error) {
      console.error(`Gagal upload ${folderPrefix}:`, error.message)
      return 'Gagal upload'
    }

    const { data } = supabase.storage.from('designs').getPublicUrl(fileName)
    return data?.publicUrl || 'Gagal ambil URL'
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      alert('Keranjang Anda masih kosong!')
      return
    }
    if (!agree) {
      alert('Harap setujui syarat & ketentuan terlebih dahulu.')
      return
    }

    setLoading(true)

    try {
      // Unggah 4 berkas ke Supabase Storage secara paralel
      const [urlDesignFront, urlDesignBack, urlMockupFront, urlMockupBack] = await Promise.all([
        uploadToStorage(designFront, 'desain_depan'),
        uploadToStorage(designBack, 'desain_belakang'),
        uploadToStorage(mockupFront, 'mockup_depan'),
        uploadToStorage(mockupBack, 'mockup_belakang'),
      ])

      const itemsSummary = cart.map(i => `${i.title} (Ukuran: ${i.size}) x${i.quantity}`).join(' | ')
      const totalPriceStr = 'Rp ' + totalNum.toLocaleString('id-ID')

      // Susun ringkasan file lengkap untuk database
      const fullFilesInfo = `[Desain Depan: ${urlDesignFront}] | [Desain Belakang: ${urlDesignBack}] | [Mockup 3D Depan: ${urlMockupFront}] | [Mockup 3D Belakang: ${urlMockupBack}]`

      const { error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: name || 'Pelanggan DSCPL',
            phone: phone || '-',
            address: `${address}, ${city}, ${province}`,
            items: `${itemsSummary} || ${fullFilesInfo}`,
            total_price: totalPriceStr,
            status: 'Pending'
          }
        ])

      if (error) {
        console.error('Supabase Insert Error:', error)
        alert('Gagal menyimpan pesanan ke database.')
        setLoading(false)
        return
      }

      localStorage.removeItem('dscpl_cart')
      setCart([])
      window.dispatchEvent(new Event('dscpl_cart_updated'))

      // Format pesan WhatsApp Admin dengan menyertakan ke-4 tautan berkas
      const adminWhatsAppNumber = '6285697211657' 
      const waMessage = `Halo Admin DSCPL WEAR, saya ingin konfirmasi pesanan baru:%0A%0A*Nama*: ${name}%0A*No HP*: ${phone}%0A*Alamat*: ${address}, ${city}, ${province}%0A*Pesanan*:%0A${itemsSummary}%0A%0A*BERKAS & MOCKUP 3D*:%0A- Desain Depan: ${urlDesignFront}%0A- Desain Belakang: ${urlDesignBack}%0A- Mockup 3D Depan: ${urlMockupFront}%0A- Mockup 3D Belakang: ${urlMockupBack}%0A%0A*Total Pembayaran*: ${totalPriceStr}`

      window.open(`https://wa.me/${adminWhatsAppNumber}?text=${waMessage}`, '_blank')

      alert('Pesanan & seluruh berkas mockup berhasil dikirim!')
      router.replace('/')

    } catch (err: any) {
      console.error('Error:', err)
      alert('Terjadi kesalahan sistem saat memproses pesanan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="border-b border-zinc-200 pb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 block mb-1">
            SECURE CHECKOUT & UPLOAD STUDIO
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-950">
            Penyelesaian Pesanan & Berkas
          </h1>
        </div>

        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: FORM PENGIRIMAN & 4 INPUT FILE */}
          <div className="lg:col-span-7 bg-zinc-50/70 p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/80 space-y-6">
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                1. Informasi Pengiriman & Berkas Desain (Depan & Belakang)
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-zinc-900 mb-1.5 uppercase tracking-wider text-[10px]">Nama Lengkap *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-white border border-zinc-300 rounded-2xl p-3.5 font-bold text-black focus:outline-none focus:border-black transition shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-zinc-900 mb-1.5 uppercase tracking-wider text-[10px]">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full bg-white border border-zinc-300 rounded-2xl p-3.5 font-bold text-black focus:outline-none focus:border-black transition shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-zinc-900 mb-1.5 uppercase tracking-wider text-[10px]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full bg-white border border-zinc-300 rounded-2xl p-3.5 font-bold text-black focus:outline-none focus:border-black transition shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-zinc-900 mb-1.5 uppercase tracking-wider text-[10px]">Alamat Lengkap *</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW..."
                  className="w-full bg-white border border-zinc-300 rounded-2xl p-3.5 font-bold text-black focus:outline-none focus:border-black transition resize-none shadow-sm"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-zinc-900 mb-1.5 uppercase tracking-wider text-[10px]">Provinsi</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-2xl p-3.5 font-bold text-black focus:outline-none focus:border-black transition shadow-sm"
                  >
                    <option value="Jawa Barat">Jawa Barat</option>
                    <option value="DKI Jakarta">DKI Jakarta</option>
                    <option value="Banten">Banten</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black text-zinc-900 mb-1.5 uppercase tracking-wider text-[10px]">Kota / Kecamatan *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Depok"
                    className="w-full bg-white border border-zinc-300 rounded-2xl p-3.5 font-bold text-black focus:outline-none focus:border-black transition shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* 4 INPUT BERKAS TERPISAH */}
              <div className="pt-4 border-t border-zinc-200 space-y-3">
                <span className="block font-black text-red-600 uppercase tracking-wider text-[11px]">
                  📁 Unggah 4 Berkas Studio (Desain & Mockup 3D)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-2xl border border-zinc-200 space-y-1">
                    <label className="block text-[10px] font-black text-zinc-700">1. File Desain Sisi Depan</label>
                    <input
                      type="file"
                      onChange={(e) => setDesignFront(e.target.files?.[0] || null)}
                      className="w-full text-[10px] text-zinc-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-zinc-900 file:text-white"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-zinc-200 space-y-1">
                    <label className="block text-[10px] font-black text-zinc-700">2. File Desain Sisi Belakang</label>
                    <input
                      type="file"
                      onChange={(e) => setDesignBack(e.target.files?.[0] || null)}
                      className="w-full text-[10px] text-zinc-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-zinc-900 file:text-white"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-zinc-200 space-y-1">
                    <label className="block text-[10px] font-black text-zinc-700">3. Mockup 3D Sisi Depan</label>
                    <input
                      type="file"
                      onChange={(e) => setMockupFront(e.target.files?.[0] || null)}
                      className="w-full text-[10px] text-zinc-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-zinc-900 file:text-white"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-zinc-200 space-y-1">
                    <label className="block text-[10px] font-black text-zinc-700">4. Mockup 3D Sisi Belakang</label>
                    <input
                      type="file"
                      onChange={(e) => setMockupBack(e.target.files?.[0] || null)}
                      className="w-full text-[10px] text-zinc-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-zinc-900 file:text-white"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 cursor-pointer w-4 h-4 accent-black"
                  required
                />
                <label htmlFor="terms" className="text-zinc-700 font-bold cursor-pointer text-xs leading-relaxed">
                  Saya memastikan seluruh berkas desain & mockup 3D sudah benar dan setuju dengan ketentuan toko *
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-zinc-800 text-white font-black py-4 px-6 rounded-2xl uppercase tracking-widest transition shadow-lg cursor-pointer text-center text-xs disabled:opacity-50"
              >
                {loading ? 'MENGUNGGAH 4 BERKAS & MEMPROSES...' : 'BUAT PESANAN & KIRIM KE WHATSAPP ➔'}
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: RINGKASAN & PREVIEW KERANJANG */}
          <div className="lg:col-span-5 bg-zinc-50/70 p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/80 space-y-6">
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                2. Ringkasan Keranjang Belanja
              </h2>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <span className="text-4xl">🛒</span>
                  <p className="text-xs text-zinc-800 font-bold">Keranjang Anda kosong.</p>
                  <Link href="/products" className="inline-block mt-2 bg-black text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-wider">
                    Pilih Produk
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="bg-white p-4 rounded-2xl border border-zinc-200/80 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-zinc-900 truncate">{item.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-semibold">Ukuran: {item.size} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-black text-xs text-red-600 flex-shrink-0">{item.price}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                      <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden bg-zinc-50">
                        <button type="button" onClick={() => handleQuantityChange(item.cartId, -1)} className="px-2.5 py-1 font-bold hover:bg-zinc-200">-</button>
                        <span className="px-2 font-black text-black">{item.quantity || 1}</span>
                        <button type="button" onClick={() => handleQuantityChange(item.cartId, 1)} className="px-2.5 py-1 font-bold hover:bg-zinc-200">+</button>
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(item.cartId)} className="text-red-500 hover:text-red-700 font-bold text-[11px]">
                        Hapus Item
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2.5 pt-3 text-xs border-t border-zinc-200">
              <div className="flex justify-between font-bold text-zinc-600">
                <span>Subtotal Produk</span>
                <span className="text-zinc-900 font-bold">Rp {subtotalNum.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-600">
                <span>Pengiriman</span>
                <span className="text-zinc-900 font-bold">Rp {shippingCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-3 border-t border-zinc-200">
                <span className="text-zinc-950">Total Pembayaran</span>
                <span className="text-red-600 text-base">Rp {totalNum.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </main>
  )
}