import { NextResponse } from 'next/server'

export async function GET() {
  // Karena menggunakan LocalStorage di client, API ini mengembalikan respon sukses standar
  return NextResponse.json({ 
    success: true, 
    message: "DSCPL WEAR Orders API Endpoint (Client-side LocalStorage storage in use)" 
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}