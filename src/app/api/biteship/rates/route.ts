import { NextResponse } from 'next/server'

// Daftar kurir yang dicek. Bisa diubah lewat BITESHIP_COURIERS di .env (dipisah koma).
const COURIERS = process.env.BITESHIP_COURIERS || 'jne,jnt,sicepat,anteraja'

// Ukuran paket standar untuk pakaian yang dilipat (cm). Sesuaikan kalau perlu.
const DEFAULT_DIMENSIONS = { length: 30, width: 25, height: 5 }

export async function POST(request: Request) {
  const apiKey = process.env.BITESHIP_API_KEY
  const originAreaId = process.env.BITESHIP_ORIGIN_AREA_ID
  const originPostalCode = process.env.BITESHIP_ORIGIN_POSTAL_CODE

  if (!apiKey) {
    return NextResponse.json({ error: 'BITESHIP_API_KEY belum diatur di server (.env).' }, { status: 500 })
  }
  if (!originAreaId && !originPostalCode) {
    return NextResponse.json(
      { error: 'Lokasi asal pengiriman belum diatur. Isi BITESHIP_ORIGIN_AREA_ID di .env.' },
      { status: 500 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 })
  }

  const destinationAreaId = String(body?.destination_area_id || '').trim()
  if (!destinationAreaId) {
    return NextResponse.json({ error: 'Kecamatan tujuan belum dipilih.' }, { status: 400 })
  }

  // Asal, kurir, dan ukuran paket ditentukan di server, bukan dari browser
  const rawItems: any[] = Array.isArray(body?.items) ? body.items : []
  const items = rawItems.map((i) => ({
    name: String(i?.name || 'Custom Apparel').slice(0, 100),
    category: 'fashion',
    value: Math.max(1, Math.round(Number(i?.value) || 50000)),
    quantity: Math.max(1, Math.floor(Number(i?.quantity) || 1)),
    weight: Math.max(1, Math.round(Number(i?.weight) || 250)),
    ...DEFAULT_DIMENSIONS,
  }))
  if (items.length === 0) {
    items.push({ name: 'Custom Apparel', category: 'fashion', value: 65000, quantity: 1, weight: 250, ...DEFAULT_DIMENSIONS })
  }

  const payload = {
    ...(originAreaId ? { origin_area_id: originAreaId } : { origin_postal_code: Number(originPostalCode) }),
    destination_area_id: destinationAreaId,
    couriers: COURIERS,
    items,
  }

  try {
    const res = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok || data.success === false) {
      return NextResponse.json(
        {
          error: data.error || data.message || `Biteship mengembalikan status ${res.status}`,
          code: data.code,
        },
        { status: res.status >= 400 ? res.status : 502 }
      )
    }

    return NextResponse.json({ pricing: data.pricing || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Gagal menghubungi Biteship' }, { status: 502 })
  }
}