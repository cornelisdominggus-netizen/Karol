import { NextResponse } from 'next/server'

// Pencarian kecamatan/kota tujuan lewat Biteship Maps API.
// API key hanya dibaca di server (BITESHIP_API_KEY), tidak pernah dikirim ke browser.
export async function GET(request: Request) {
  const apiKey = process.env.BITESHIP_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { areas: [], error: 'BITESHIP_API_KEY belum diatur di server (.env).' },
      { status: 500 }
    )
  }

  const input = (new URL(request.url).searchParams.get('input') || '').trim()
  if (input.length < 3) {
    return NextResponse.json({ areas: [] })
  }

  try {
    const res = await fetch(
      `https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(input)}&type=single`,
      {
        headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    )

    const data = await res.json().catch(() => ({}))

    if (!res.ok || data.success === false) {
      return NextResponse.json(
        {
          areas: [],
          error: data.error || data.message || `Biteship mengembalikan status ${res.status}`,
          code: data.code,
        },
        { status: res.status >= 400 ? res.status : 502 }
      )
    }

    return NextResponse.json({ areas: data.areas || [] })
  } catch (e: any) {
    return NextResponse.json({ areas: [], error: e?.message || 'Gagal menghubungi Biteship' }, { status: 502 })
  }
}