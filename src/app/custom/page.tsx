'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

const Mockup3D = dynamic(() => import('@/components/Mockup3D'), { ssr: false })

type ApparelType = 'kaos' | 'oversized' | 'hoodie' | 'topi'
type Side = 'front' | 'back'

const APPAREL_TYPES: ApparelType[] = ['kaos', 'oversized', 'hoodie', 'topi']
const SIDES: Side[] = ['front', 'back']
const SIDE_LABEL: Record<Side, string> = { front: 'Depan', back: 'Belakang' }

interface SideDesign {
  image: string | null
  name: string
  scale: number
  x: number
  y: number
}

const EMPTY_SIDE: SideDesign = { image: null, name: '', scale: 0.8, x: 0, y: 0.1 }

function CustomStudio() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const typeParam = searchParams.get('type')
  const productIdParam = searchParams.get('id')

  const initialType: ApparelType = APPAREL_TYPES.includes(typeParam as ApparelType)
    ? (typeParam as ApparelType)
    : 'kaos'

  const [selectedType, setSelectedType] = useState<ApparelType>(initialType)
  const [selectedColor, setSelectedColor] = useState<string>('#ffffff')
  
  const [productTitle, setProductTitle] = useState<string>('Custom Apparel')
  const [unitPrice, setUnitPrice] = useState<number>(95000)

  const [catalogProducts, setCatalogProducts] = useState<any[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>(productIdParam || '')

  const [designs, setDesigns] = useState<Record<Side, SideDesign>>({ front: EMPTY_SIDE, back: EMPTY_SIDE })
  const [activeSide, setActiveSide] = useState<Side>('front')

  const [size, setSize] = useState<string>('L')
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)

  const downloadTriggerRef = useRef<(() => void) | null>(null)

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
  }

  useEffect(() => {
    if (typeParam && APPAREL_TYPES.includes(typeParam as ApparelType)) {
      if (typeParam !== selectedType) {
        setSelectedType(typeParam as ApparelType)
      }
    }
  }, [typeParam])

  useEffect(() => {
    const fetchCatalogByCategory = async () => {
      let categoryKeyword = 'Kaos'
      if (selectedType === 'hoodie') categoryKeyword = 'Hoodie'
      else if (selectedType === 'topi') categoryKeyword = 'Topi'
      else if (selectedType === 'oversized') categoryKeyword = 'Oversized'

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', `%${categoryKeyword}%`)
        .order('created_at', { ascending: false })

      if (data && !error && data.length > 0) {
        setCatalogProducts(data)
        const matchCurrent = data.find((p: any) => String(p.id) === productIdParam)
        if (matchCurrent) {
          setSelectedCatalogId(String(matchCurrent.id))
          setProductTitle(matchCurrent.title)
          const parsedPrice = parseInt(String(matchCurrent.price).replace(/[^0-9]/g, ''))
          if (parsedPrice > 0) setUnitPrice(parsedPrice)
        } else {
          const firstProd = data[0]
          setSelectedCatalogId(String(firstProd.id))
          setProductTitle(firstProd.title)
          const parsedPrice = parseInt(String(firstProd.price).replace(/[^0-9]/g, ''))
          if (parsedPrice > 0) setUnitPrice(parsedPrice)
        }
      } else {
        setCatalogProducts([])
      }
    }

    fetchCatalogByCategory()
  }, [selectedType, productIdParam])

  const updateSide = (side: Side, patch: Partial<SideDesign>) => {
    setDesigns((d) => ({ ...d, [side]: { ...d[side], ...patch } }))
  }

  const handleTypeChange = (type: ApparelType) => {
    if (type === selectedType) return
    setSelectedType(type)
    
    const defaultPrices: Record<ApparelType, number> = {
      kaos: 95000,
      oversized: 120000,
      hoodie: 220000,
      topi: 75000,
    }
    setUnitPrice(defaultPrices[type])
    setProductTitle(`Custom ${type.toUpperCase()}`)

    router.replace(`/custom?type=${type}`, { scroll: false })
  }

  const handleSelectCatalogProduct = (prod: any) => {
    setSelectedCatalogId(String(prod.id))
    setProductTitle(prod.title)
    const parsedPrice = parseInt(String(prod.price).replace(/[^0-9]/g, ''))
    if (parsedPrice > 0) setUnitPrice(parsedPrice)

    router.replace(`/custom?type=${selectedType}&id=${prod.id}`, { scroll: false })
  }

  const handleFileChange = (side: Side) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        updateSide(side, {
          image: uploadEvent.target.result as string,
          name: file.name,
          scale: 0.8,
          x: 0,
          y: 0.1,
        })
        setActiveSide(side)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeDesign = (side: Side) => {
    setDesigns((d) => ({ ...d, [side]: EMPTY_SIDE }))
  }

  const totalPrice = unitPrice * quantity

  const handleDownload3DPreview = () => {
    if (downloadTriggerRef.current) {
      downloadTriggerRef.current()
    } else {
      alert('Canvas 3D belum siap dimuat.')
    }
  }

  // FUNGSI SIMPAN KE KERANJANG ANTI-QUOTA EXCEEDED
  const handleAddToCart = async () => {
    if (!designs.front.image && !designs.back.image) {
      alert('Harap unggah minimal satu desain sablon (depan atau belakang) terlebih dahulu!')
      return
    }

    setLoading(true)

    try {
      const filesDesc = SIDES.filter((s) => designs[s].name).map((s) => `${SIDE_LABEL[s]}: ${designs[s].name}`).join(' | ')

      const newItem = {
        cartId: Date.now(),
        id: Date.now(),
        title: productTitle,
        price: 'Rp ' + totalPrice.toLocaleString('id-ID'),
        size: size,
        quantity: quantity,
        image: 'Custom 3D Apparel',
        imageFront: designs.front.name ? `Desain Depan: ${designs.front.name}` : null,
        imageBack: designs.back.name ? `Desain Belakang: ${designs.back.name}` : null,
        designFile: filesDesc,
      }

      let existingCart = []
      try {
        existingCart = JSON.parse(localStorage.getItem('dscpl_cart') || '[]')
      } catch (e) {
        existingCart = []
      }

      const updatedCart = [...existingCart, newItem]

      try {
        localStorage.setItem('dscpl_cart', JSON.stringify(updatedCart))
      } catch (storageError) {
        // Jika storage penuh, reset dan simpan item terbaru saja
        localStorage.setItem('dscpl_cart', JSON.stringify([newItem]))
      }

      window.dispatchEvent(new Event('dscpl_cart_updated'))

      setLoading(false)
      alert('Desain berhasil disimpan dan dimasukkan ke keranjang!')
      router.push('/checkout')
    } catch (err) {
      console.error('Error simpan keranjang:', err)
      setLoading(false)
      alert('Gagal menyimpan ke keranjang.')
    }
  }

  const active = designs[activeSide]

  const DielinePanel = ({ side }: { side: Side }) => {
    const d = designs[side]
    const isActive = activeSide === side
    return (
      <button
        type="button"
        onClick={() => setActiveSide(side)}
        className={`w-full h-36 sm:h-40 bg-zinc-900 rounded-2xl border relative flex items-center justify-center overflow-hidden p-2 text-left cursor-pointer transition ${
          isActive ? 'border-blue-500 ring-1 ring-blue-500/60' : 'border-zinc-800 opacity-70 hover:opacity-100'
        }`}
      >
        <span className="absolute top-2 left-2 text-[8px] text-zinc-400 font-black uppercase">
          {SIDE_LABEL[side]}
        </span>

        <svg className="absolute w-24 h-28 opacity-15 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 2H8.5L5 6l3 2v12h8V8l3-2-3.5-4z" />
        </svg>

        {d.image ? (
          <div
            className="absolute z-10 flex items-center justify-center border-2 border-blue-500 bg-blue-500/5 p-1 transition-all shadow-lg"
            style={{
              width: `${d.scale * 60}%`,
              height: `${d.scale * 60}%`,
              transform: `translate(${d.x * 60}px, ${-d.y * 60}px)`,
            }}
          >
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-white border border-blue-600 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white border border-blue-600 rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white border border-blue-600 rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-white border border-blue-600 rounded-full"></div>
            <img src={d.image} alt={`Desain ${SIDE_LABEL[side]}`} className="w-full h-full object-contain pointer-events-none" />
          </div>
        ) : (
          <span className="text-[9px] text-zinc-500 font-medium text-center z-10">
            {side === 'front' ? 'Upload depan' : 'Polos'}
          </span>
        )}
      </button>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-black pb-20 pt-6 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: 3D LIVE PREVIEW */}
        <div className="lg:col-span-7 flex flex-col bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-4 shadow-2xl relative min-h-[500px] lg:min-h-[650px]">
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              3D Live Preview ({productTitle})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload3DPreview}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1"
                title="Download gambar 3D sisi yang sedang dilihat"
              >
                📥 Download Preview
              </button>
              <div className="flex gap-1">
                {SIDES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSide(s)}
                    className={`text-[10px] px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                      activeSide === s ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {SIDE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full flex-1 flex items-center justify-center rounded-2xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden relative min-h-[420px]">
            <Mockup3D
              apparelType={selectedType}
              color={selectedColor}
              viewSide={activeSide}
              designs={{
                front: { image: designs.front.image, scale: designs.front.scale, x: designs.front.x, y: designs.front.y },
                back: { image: designs.back.image, scale: designs.back.scale, x: designs.back.x, y: designs.back.y },
              }}
              onDownloadRef={downloadTriggerRef}
            />
          </div>
        </div>

        {/* KOLOM KANAN: EDITOR */}
        <div className="lg:col-span-5 bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-zinc-800/80 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-red-500">Studio Editor 3D & Katalog</h2>
              <p className="text-xs text-zinc-400 font-medium">Pilih pakaian, atur desain, dan sesuaikan pesanan Anda.</p>
            </div>

            {/* 1. PILIH JENIS PAKAIAN & KATALOG */}
            <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80 space-y-3">
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300">Jenis Pakaian</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {APPAREL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                      selectedType === type ? 'bg-white text-black border-white shadow' : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="pt-2 space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300">2. Pilih Katalog Spesifik</label>
                {catalogProducts.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic">Belum ada produk untuk kategori ini.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1">
                    {catalogProducts.map((prod) => {
                      const isSelected = selectedCatalogId === String(prod.id)
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleSelectCatalogProduct(prod)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition cursor-pointer ${
                            isSelected ? 'bg-red-600/20 border-red-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {prod.image && <img src={prod.image} alt="" className="w-7 h-7 object-cover rounded-lg bg-zinc-800 flex-shrink-0" />}
                            <span className="text-xs font-bold truncate">{prod.title}</span>
                          </div>
                          <span className="text-xs font-black text-red-400 flex-shrink-0 ml-2">{prod.price}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. TEMPLATE DIELINE */}
            <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Template Dieline Sisi Cetak</span>
                <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-bold">Klik sisi aktif</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DielinePanel side="front" />
                <DielinePanel side="back" />
              </div>
            </div>

            {/* SLIDER UNTUK SISI YANG AKTIF */}
            {active.image && (
              <div className="bg-zinc-800/80 p-3.5 rounded-2xl border border-zinc-700/60 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-white block">
                  📐 Atur Posisi Desain {SIDE_LABEL[activeSide]}
                </span>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                    <span>Ukuran (Scale)</span>
                    <span>{Math.round(active.scale * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0.3" max="1.5" step="0.05"
                    value={active.scale}
                    onChange={(e) => updateSide(activeSide, { scale: Number(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer bg-zinc-700 h-1 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                      <span>Geser Kiri/Kanan</span>
                      <span>{active.x.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="-1" max="1" step="0.05"
                      value={active.x}
                      onChange={(e) => updateSide(activeSide, { x: Number(e.target.value) })}
                      className="w-full accent-red-600 cursor-pointer bg-zinc-700 h-1 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                      <span>Geser Atas/Bawah</span>
                      <span>{active.y.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="-1" max="0.9" step="0.05"
                      value={active.y}
                      onChange={(e) => updateSide(activeSide, { y: Number(e.target.value) })}
                      className="w-full accent-red-600 cursor-pointer bg-zinc-700 h-1 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. WARNA BAHAN */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300">Warna Bahan</label>
              <div className="flex gap-2.5 pt-1">
                {[
                  { name: 'White', hex: '#ffffff' },
                  { name: 'Black', hex: '#111111' },
                  { name: 'Gray', hex: '#71717a' },
                  { name: 'Navy', hex: '#1e1b4b' },
                  { name: 'Red', hex: '#7f1d1d' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(c.hex)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                      selectedColor === c.hex ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-zinc-900 scale-110' : 'border-zinc-700'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* 4. UNGGAH ARTWORK */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300">Unggah Artwork (PNG Transparan)</label>
              <div className="grid grid-cols-2 gap-3">
                {SIDES.map((side) => (
                  <div key={side} className="relative">
                    <input
                      type="file"
                      ref={fileInputRefs[side]}
                      onChange={handleFileChange(side)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRefs[side].current?.click()}
                      className="w-full border-2 border-dashed border-zinc-700 hover:border-white py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition bg-zinc-800/40 cursor-pointer"
                    >
                      <span className="text-[10px] font-black uppercase text-zinc-400">Desain {SIDE_LABEL[side]}</span>
                      <span className="text-[11px] font-black text-zinc-200 max-w-full truncate">
                        {designs[side].name ? `📁 ${designs[side].name}` : '📁 Pilih File'}
                      </span>
                    </button>
                    {designs[side].image && (
                      <button
                        onClick={() => removeDesign(side)}
                        title={`Hapus desain ${SIDE_LABEL[side]}`}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center cursor-pointer hover:bg-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. UKURAN & JUMLAH */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1">Ukuran</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-white"
                >
                  {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-300 mb-1">Jumlah</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-white"
                />
              </div>
            </div>
          </div>

          {/* CHECKOUT & TOTAL */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-500">Total Harga ({quantity} Pcs)</p>
              <p className="text-lg font-black text-red-500">Rp {totalPrice.toLocaleString('id-ID')}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="bg-white hover:bg-zinc-200 text-black font-black text-xs px-5 py-3.5 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-lg whitespace-nowrap"
            >
              {loading ? 'Menyimpan...' : 'Masukkan Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CustomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-xs font-bold">Memuat studio...</div>}>
      <CustomStudio />
    </Suspense>
  )
}