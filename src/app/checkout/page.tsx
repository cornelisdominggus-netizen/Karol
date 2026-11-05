'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  
  // Form Tagihan & File Desain
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [province, setProvince] = useState('Jawa Barat')
  const [city, setCity] = useState('Depok')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [designFile, setDesignFile] = useState<File | null>(null) // State untuk file desain
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
      let filePublicUrl = 'Tanpa file'

      // Jika pembeli melampirkan file, upload ke Supabase Storage bucket 'designs'
      if (designFile) {
        const fileExt = designFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('designs') // Menggunakan bucket 'designs' yang ada di Supabase kamu
          .upload(fileName, designFile)

        if (uploadError) {
          console.error('Supabase Storage Error:', uploadError.message)
          alert('Gagal mengunggah file desain: ' + uploadError.message)
          setLoading(false)
          return
        }

        // Ambil URL publik file
        const { data: publicURLData } = supabase.storage
          .from('designs')
          .getPublicUrl(fileName)

        filePublicUrl = publicURLData.publicUrl
      }

      // Rangkuman item pesanan
      const itemsSummary = cart.map(i => `${i.title} (${i.size}) x${i.quantity}`).join(', ')
      const totalPriceStr = 'Rp ' + totalNum.toLocaleString('id-ID')

      // Simpan data pesanan ke database Supabase tabel 'orders'
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: name || 'Pelanggan DSCPL',
            phone: phone || '-',
            address: `${address}, ${city}, ${province}`,
            items: `${itemsSummary} | File Desain: ${filePublicUrl}`,
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

      // Kosongkan keranjang setelah berhasil
      localStorage.removeItem('dscpl_cart')
      setCart([])
      window.dispatchEvent(new Event('dscpl_cart_updated'))

      // Format pesan WhatsApp Admin dengan menyertakan link file desain
      const adminWhatsAppNumber = '6285697211657' 
      const waMessage = `Halo Admin DSCPL WEAR, saya ingin konfirmasi pesanan baru:%0A%0A*Nama*: ${name}%0A*No HP*: ${phone}%0A*Alamat*: ${address}, ${city}, ${province}%0A*Pesanan*:%0A${itemsSummary}%0A*Link File Desain*: ${filePublicUrl}%0A*Total Pembayaran*: ${totalPriceStr}`

      window.open(`https://wa.me/${adminWhatsAppNumber}?text=${waMessage}`, '_blank')

      alert('Pesanan & file desain berhasil dibuat!')
      router.replace('/')

    } catch (err: any) {
      console.error('Error:', err)
      alert('Terjadi kesalahan sistem saat memproses pesanan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Login Cepat */}
        <div className="bg-black text-white p-4 rounded-2xl flex justify-between items-center text-xs font-bold">
          <span>Masuk untuk kemudahan checkout & pengumpulan koin reward.</span>
          <Link href="/admin/login" className="bg-white text-black px-4 py-2 rounded-xl">Login dengan Google / Admin</Link>
        </div>

        {/* 3 Kolom Utama */}
        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* KOLOM 1: DETAIL TAGIHAN & UPLOAD FILE */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-600">1. DETAIL TAGIHAN</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-black mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-black focus:outline-none placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-black mb-1">Negara</label>
                <select className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-black">
                  <option>Indonesia</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-black mb-1">Alamat Lengkap *</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-black focus:outline-none placeholder:text-gray-400"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-black text-black mb-1">Provinsi</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-black"
                >
                  <option value="Jawa Barat">Jawa Barat</option>
                  <option value="DKI Jakarta">DKI Jakarta</option>
                  <option value="Banten">Banten</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-black mb-1">Kota / Kecamatan *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Depok / Pancoran Mas"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-black focus:outline-none placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-black mb-1">Nomor WhatsApp *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-black focus:outline-none placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-black mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-black focus:outline-none placeholder:text-gray-400"
                />
              </div>

              {/* INPUT UPLOAD FILE DESAIN */}
              <div className="pt-2 border-t space-y-1">
                <label className="block font-black text-red-600 mb-1">📁 Unggah File Desain / Mockup</label>
                <input
                  type="file"
                  onChange={(e) => setDesignFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-bold text-black file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-black file:bg-black file:text-white hover:file:cursor-pointer"
                />
                <p className="text-[10px] text-gray-500 font-medium">Format: PNG, JPEG, PDF (Maks. 10MB)</p>
              </div>

            </div>
          </div>

          {/* KOLOM 2: RINGKASAN PESANAN */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-600">2. PESANAN ANDA</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 text-[11px] font-black text-gray-700 uppercase border-b pb-2">
                <span className="col-span-5">PRODUK</span>
                <span className="col-span-3 text-center">JUMLAH</span>
                <span className="col-span-3 text-right">TOTAL</span>
                <span className="col-span-1 text-center">HAPUS</span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <span className="text-3xl">🛒</span>
                  <p className="text-xs text-black font-bold">Keranjang Anda kosong.</p>
                  <Link href="/products" className="inline-block mt-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-xl">
                    Pilih Produk
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="grid grid-cols-12 items-center text-xs border-b pb-3 gap-1">
                    <div className="col-span-5 flex items-center gap-2">
                      <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-black truncate">{item.title}</h4>
                        <p className="text-[10px] text-gray-600 font-semibold">Ukuran: {item.size}</p>
                      </div>
                    </div>

                    <div className="col-span-3 flex items-center justify-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <button type="button" onClick={() => handleQuantityChange(item.cartId, -1)} className="px-2 py-1 font-bold hover:bg-gray-200">-</button>
                      <span className="px-2 font-black text-black">{item.quantity || 1}</span>
                      <button type="button" onClick={() => handleQuantityChange(item.cartId, 1)} className="px-2 py-1 font-bold hover:bg-gray-200">+</button>
                    </div>

                    <div className="col-span-3 text-right font-black text-red-600 truncate">
                      Rp {((parseInt(item.price.replace(/[^0-9]/g, '')) || 0) * (item.quantity || 1)).toLocaleString('id-ID')}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.cartId)}
                        className="text-red-600 hover:text-red-800 font-black p-1 text-sm rounded-lg hover:bg-red-50 transition"
                        title="Hapus item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-3 text-xs border-t">
              <div className="flex justify-between font-black text-black">
                <span>Subtotal</span>
                <span>Rp {subtotalNum.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-black text-black">
                <span>Pengiriman (Depok & Sekitarnya)</span>
                <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t">
                <span className="text-black">Total</span>
                <span className="text-red-600">Rp {totalNum.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* KOLOM 3: PEMBAYARAN */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-600">3. PEMBAYARAN & KONFIRMASI</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-2">
                <p className="font-black text-blue-900">💬 Otomatis Kirim File Desain</p>
                <p className="text-blue-800 font-medium leading-relaxed">
                  File desain yang Anda unggah akan otomatis disimpan ke database, dan link unduhannya langsung disertakan ke WhatsApp admin.
                </p>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-black font-bold cursor-pointer">
                  Saya sudah membaca dan setuju dengan syarat & ketentuan toko *
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider transition shadow-md cursor-pointer text-center text-xs"
              >
                {loading ? 'MENGUNGGAH & MEMPROSES...' : 'BUAT PESANAN & KIRIM KE WHATSAPP ➔'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </main>
  )
}