'use client'

import { useState, useEffect, useRef } from 'react'
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

  const [destinationAreaId, setDestinationAreaId] = useState('')
  const [areaQuery, setAreaQuery] = useState('')
  const [areaResults, setAreaResults] = useState<any[]>([])
  const [courierRates, setCourierRates] = useState<any[]>([])
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [shippingCost, setShippingCost] = useState(0)
  const [fetchingRates, setFetchingRates] = useState(false)

  const [shippingError, setShippingError] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fungsi helper helper penampil nama warna agar konsisten di WhatsApp & Checkout
  const getColorDisplayName = (colorData: any) => {
    if (!colorData) return '-'
    if (typeof colorData === 'object' && colorData.name) {
      return colorData.name
    }
    const hex = String(colorData).toLowerCase().trim()
    const mapping: { [key: string]: string } = {
      '#ffffff': 'Putih',
      '#000000': 'Hitam',
      '#111111': 'Hitam Pekat',
      '#71717a': 'Abu-Abu',
      '#808080': 'Abu-Abu',
      '#ff0000': 'Merah',
      '#00ff00': 'Hijau',
      '#008000': 'Hijau',
      '#0000ff': 'Biru',
      '#000080': 'Navy / Biru Dongker',
      '#ff00ff': 'Magenta',
      '#ffff00': 'Kuning',
      '#ffa500': 'Oranye',
      '#ff8c00': 'Oranye',
      '#800080': 'Ungu',
      '#981bc5': 'Ungu',
      '#61177c': 'Ungu',
      '#ffc0cb': 'Pink / Merah Muda',
      '#a52a2a': 'Cokelat',
    }
    return mapping[hex] || (typeof colorData === 'string' && !colorData.startsWith('#') ? colorData : 'Warna Custom')
  }

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setAreaQuery(query)

    setDestinationAreaId('')
    setCourierRates([])
    setSelectedRate(null)
    setShippingCost(0)
    setShippingError('')

    if (searchTimer.current) clearTimeout(searchTimer.current)

    if (query.trim().length < 3) {
      setAreaResults([])
      return
    }

    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/biteship/areas?input=${encodeURIComponent(query.trim())}`)
        const data = await res.json()

        if (!res.ok || data.error) {
          setAreaResults([])
          setShippingError(data.error || 'Pencarian kecamatan gagal.')
          return
        }

        const results = data.areas || []
        setAreaResults(results)
        if (results.length === 0) {
          setShippingError('Kecamatan tidak ditemukan. Coba ketik nama kecamatannya saja, misalnya "Sukmajaya".')
        }
      } catch (err) {
        console.error('Error fetching areas:', err)
        setAreaResults([])
        setShippingError('Tidak bisa terhubung ke server ongkir.')
      }
    }, 400)
  }

  const handleSelectArea = async (area: any) => {
    const areaName = area.name || area.label || 'Kecamatan Terpilih'
    setDestinationAreaId(area.id || area.area_id)
    setAreaQuery(areaName)
    setAreaResults([])
    setCity(area.city || area.administrative_division_level_2_name || 'Depok')
    setProvince(area.administrative_division_level_1_name || area.province_name || 'Jawa Barat')

    await fetchBiteshipRates(area.id || area.area_id)
  }

  const fetchBiteshipRates = async (targetAreaId: string) => {
    setFetchingRates(true)
    setCourierRates([])
    setSelectedRate(null)
    setShippingCost(0)
    setShippingError('')

    try {
      const res = await fetch('/api/biteship/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_area_id: targetAreaId,
          items: cart.length > 0
            ? cart.map((i) => ({
                name: i.title,
                value: parseInt(String(i.price).replace(/[^0-9]/g, '')) || 50000,
                quantity: i.quantity || 1,
                weight: i.weight || 250
              }))
            : [{ name: 'Custom Apparel', value: 65000, quantity: 1, weight: 250 }]
        })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setShippingError(data.error || 'Gagal mengambil tarif kurir.')
        return
      }

      const pricingList: any[] = data.pricing || []
      if (pricingList.length === 0) {
        setShippingError('Tidak ada layanan kurir yang tersedia untuk area ini.')
        return
      }

      pricingList.sort((a, b) => a.price - b.price)
      setCourierRates(pricingList)
      setSelectedRate(pricingList[0])
      setShippingCost(pricingList[0].price)
    } catch (err) {
      console.error('Error fetching rates:', err)
      setShippingError('Tidak bisa terhubung ke server ongkir.')
    } finally {
      setFetchingRates(false)
    }
  }

  const handleSelectCourierRate = (rate: any) => {
    setSelectedRate(rate)
    setShippingCost(rate.price)
  }

  const handleQuantityChange = (cartId: string, delta: number) => {
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

  const handleRemoveItem = (cartId: string) => {
    const updated = cart.filter(item => item.cartId !== cartId)
    setCart(updated)
    localStorage.setItem('dscpl_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('dscpl_cart_updated'))
  }

  const subtotalNum = cart.reduce((acc, item) => {
    const p = parseInt(String(item.price).replace(/[^0-9]/g, '')) || 0
    return acc + (p * (item.quantity || 1))
  }, 0)

  const totalNum = subtotalNum + (cart.length > 0 ? shippingCost : 0)

  const dataURLtoFile = (dataurl: string, filename: string) => {
    try {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    } catch (e) {
      return null
    }
  }

  const uploadToStorage = async (fileObj: File | null, folderPrefix: string) => {
    if (!fileObj) return null
    const fileName = `${folderPrefix}_${Date.now()}_${Math.random().toString(36).substring(2)}.png`
    
    const { error } = await supabase.storage.from('designs').upload(fileName, fileObj, {
      contentType: fileObj.type,
      upsert: true
    })
    if (error) return null

    const { data } = supabase.storage.from('designs').getPublicUrl(fileName)
    return data?.publicUrl || null
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      alert('Keranjang Anda masih kosong!')
      return
    }
    if (!destinationAreaId) {
      alert('Silakan pilih kecamatan/kota tujuan dari dropdown hasil pencarian!')
      return
    }
    if (!selectedRate) {
      alert('Silakan pilih kurir pengiriman.')
      return
    }
    if (!agree) {
      alert('Harap setujui syarat & ketentuan.')
      return
    }

    setLoading(true)

    try {
      const processedCart = []

      for (const item of cart) {
        let frontUrl = item.frontDesignImage || null
        let backUrl = item.backDesignImage || null

        if (item.frontDesignImage && item.frontDesignImage.startsWith('data:image')) {
          const fileFront = dataURLtoFile(item.frontDesignImage, 'desain_depan.png')
          const uploadedUrl = await uploadToStorage(fileFront, 'desain_depan')
          if (uploadedUrl) frontUrl = uploadedUrl
        }

        if (item.backDesignImage && item.backDesignImage.startsWith('data:image')) {
          const fileBack = dataURLtoFile(item.backDesignImage, 'desain_belakang.png')
          const uploadedUrl = await uploadToStorage(fileBack, 'desain_belakang')
          if (uploadedUrl) backUrl = uploadedUrl
        }

        processedCart.push({
          ...item,
          frontDesignImage: frontUrl,
          backDesignImage: backUrl,
          image: frontUrl || item.image || item.frontDesignImage
        })
      }

      // Format WhatsApp menyertakan Ukuran & Nama Warna yang jelas
      const itemsSummary = processedCart.map(i => `• ${i.title} (Ukuran: ${i.size || '-'}, Warna: ${getColorDisplayName(i.color)}) x${i.quantity}`).join('\n')
      const totalPriceStr = 'Rp ' + totalNum.toLocaleString('id-ID')
      const chosenCourierStr = `${selectedRate.courier_name.toUpperCase()} ${selectedRate.courier_service_name} (Estimasi ${selectedRate.duration})`

      const { data: insertedOrder, error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: name || 'Pelanggan DSCPL',
            phone: phone || '-',
            address: `${address}, ${city}, ${province} [Kurir: ${chosenCourierStr}, Ongkir: Rp ${shippingCost.toLocaleString('id-ID')}]`,
            items: processedCart,
            total_price: totalPriceStr,
            status: 'Pending'
          }
        ])
        .select('id')
        .single()

      if (error) {
        alert('Gagal menyimpan pesanan: ' + error.message)
        setLoading(false)
        return
      }

      const orderId = insertedOrder?.id || 'BARU'

      localStorage.removeItem('dscpl_cart')
      setCart([])
      window.dispatchEvent(new Event('dscpl_cart_updated'))

      const adminWhatsAppNumber = '62895345414336'
      const designLinksText = processedCart.map(i => `• ${i.title}\nDepan: ${i.frontDesignImage || 'Tidak ada'}\nBelakang: ${i.backDesignImage || 'Tidak ada'}`).join('\n')
      
      const messageText = `Halo Admin DSCPL WEAR, saya ingin konfirmasi pesanan baru:

*ID Pesanan*: #${orderId}
*Nama*: ${name}
*No HP*: ${phone}
*Alamat*: ${address}, ${city}, ${province}
*Kurir*: ${chosenCourierStr} (Ongkir: Rp ${shippingCost.toLocaleString('id-ID')})

*Pesanan*:
${itemsSummary}

*LINK BERKAS DESAIN*:
${designLinksText}

*Total Pembayaran*: ${totalPriceStr}`

      window.open(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(messageText)}`, '_blank')

      alert(`Pesanan #${orderId} berhasil dibuat & otomatis terkirim ke WhatsApp Admin!`)
      router.replace('/')

    } catch (err: any) {
      alert('Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="border-b border-zinc-200 pb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 block mb-1">
            SECURE CHECKOUT & BITESHIP PRO API
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-950">
            Penyelesaian Pesanan & Cek Ongkir Otomatis
          </h1>
        </div>

        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-zinc-50/70 p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/80 space-y-6">
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                1. Informasi Pengiriman dari Workshop Depok
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

              {/* SEARCH AREA */}
              <div className="relative">
                <label className="block font-black text-zinc-900 mb-1.5 uppercase tracking-wider text-[10px]">Cari Kecamatan / Kota Tujuan (Wajib Pilih dari Dropdown) *</label>
                <input
                  type="text"
                  value={areaQuery}
                  onChange={handleSearchChange}
                  placeholder="Ketik minimal 3 huruf (Contoh: Sukmajaya, Depok)..."
                  className="w-full bg-white border border-zinc-300 rounded-2xl p-3.5 font-bold text-black focus:outline-none focus:border-black transition shadow-sm relative z-10"
                  required
                />
                
                {areaResults.length > 0 && (
                  <div className="absolute z-[99999] left-0 right-0 top-full mt-2 bg-white border-2 border-black rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                    {areaResults.map((area, idx) => (
                      <div
                        key={area.id || area.area_id || idx}
                        onClick={() => handleSelectArea(area)}
                        className="p-3.5 hover:bg-black hover:text-white cursor-pointer border-b border-zinc-100 text-xs font-bold transition"
                      >
                        <p className="font-black">{area.name || area.label}</p>
                        <p className="text-[10px] opacity-80 mt-0.5">
                          {area.administrative_division_level_3_name || area.district_name || ''}, {area.administrative_division_level_2_name || area.city_name || ''}, {area.administrative_division_level_1_name || area.province_name || ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LIST KURIR */}
              <div>
                <label className="block font-black text-zinc-900 mb-1.5 uppercase tracking-wider text-[10px]">Pilih Layanan Kurir Real-Time (Biteship) *</label>
                {fetchingRates ? (
                  <div className="p-4 bg-white border border-zinc-300 rounded-2xl text-center text-xs font-bold text-zinc-500 animate-pulse">
                    Menghitung tarif ongkir real-time dari Biteship...
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {courierRates.map((rate, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectCourierRate(rate)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${selectedRate?.courier_code === rate.courier_code && selectedRate?.courier_service_code === rate.courier_service_code ? 'border-black bg-black text-white' : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400'}`}
                      >
                        <div>
                          <p className="font-black uppercase text-xs">{rate.courier_name} — {rate.courier_service_name}</p>
                          <p className={`text-[10px] ${selectedRate?.courier_code === rate.courier_code && selectedRate?.courier_service_code === rate.courier_service_code ? 'text-zinc-300' : 'text-zinc-500'}`}>Estimasi: {rate.duration}</p>
                        </div>
                        <p className={`font-black text-xs ${selectedRate?.courier_code === rate.courier_code && selectedRate?.courier_service_code === rate.courier_service_code ? 'text-red-400' : 'text-red-600'}`}>
                          Rp {rate.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {shippingError && (
                  <p className="mt-2 text-[11px] font-bold text-red-600">{shippingError}</p>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-200 bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-black text-xs uppercase tracking-wider">✨ Berkas Studio Terlampir Otomatis</p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Desain depan dan belakang yang Anda buat di studio akan otomatis di-upload ke server Supabase dan bisa langsung didownload oleh Admin.
                </p>
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
                  Saya memastikan pesanan dan desain dari studio sudah benar dan setuju dengan ketentuan toko *
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-zinc-800 text-white font-black py-4 px-6 rounded-2xl uppercase tracking-widest transition shadow-lg cursor-pointer text-center text-xs disabled:opacity-50"
              >
                {loading ? 'MEMPROSES & MENGIRIM BERKAS...' : 'BUAT PESANAN & KIRIM KE WHATSAPP ➔'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50/70 p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/80 space-y-6">
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                2. Ringkasan Keranjang & Desain Anda
              </h2>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
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
                    <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                      
                      <div className="w-14 h-14 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0 flex items-center justify-center p-1">
                        {item.image || item.frontDesignImage ? (
                          <img src={item.image || item.frontDesignImage} alt={item.title} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-zinc-400">No Image</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs text-zinc-900 truncate">{item.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-semibold">
                          Ukuran: {item.size || '-'} {item.color ? `| Warna: ${getColorDisplayName(item.color)}` : ''} | Qty: {item.quantity}
                        </p>
                        <p className="font-black text-xs text-red-600 mt-0.5">{item.price}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {item.frontDesignImage && (
                        <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-200 text-center">
                          <span className="block text-[8px] font-black uppercase text-zinc-400 mb-1">Desain Depan</span>
                          <img src={item.frontDesignImage} alt="Depan" className="w-16 h-16 object-contain mx-auto bg-white rounded-lg border p-1" />
                        </div>
                      )}
                      {item.backDesignImage && (
                        <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-200 text-center">
                          <span className="block text-[8px] font-black uppercase text-zinc-400 mb-1">Desain Belakang</span>
                          <img src={item.backDesignImage} alt="Belakang" className="w-16 h-16 object-contain mx-auto bg-white rounded-lg border p-1" />
                        </div>
                      )}
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
                <span>Ongkir ({selectedRate ? `${selectedRate.courier_name} ${selectedRate.courier_service_name}` : 'Biteship'})</span>
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