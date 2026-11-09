'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function HubungiAdminPage() {
  const [mode, setMode] = useState<'choice' | 'livechat'>('choice')
  const [roomId, setRoomId] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Nomor WhatsApp Admin
  const whatsappNumber = '62895345414336'
  const waMessage = encodeURIComponent('Halo Admin DSCPL WEAR, saya ingin bertanya mengenai custom apparel dan pemesanan.')

  useEffect(() => {
    let savedRoom = localStorage.getItem('dscpl_chat_room')
    if (!savedRoom) {
      savedRoom = 'DSCPL-' + Math.floor(100000 + Math.random() * 900000)
      localStorage.setItem('dscpl_chat_room', savedRoom)
    }
    setRoomId(savedRoom)
  }, [])

  // Ambil riwayat chat & pasang Real-time listener jika mode live chat aktif
  useEffect(() => {
    if (mode !== 'livechat' || !roomId) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chats')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }
    fetchMessages()

    const chatChannel = supabase
      .channel(`customer-room-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats', filter: `room_id=eq.${roomId}` },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(chatChannel)
    }
  }, [mode, roomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || !roomId) return

    const { error } = await supabase.from('chats').insert([
      {
        room_id: roomId,
        sender: 'customer',
        message: inputMsg.trim()
      }
    ])

    if (!error) {
      setInputMsg('')
    } else {
      alert('Gagal mengirim pesan.')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 sm:p-8 flex flex-col justify-center items-center selection:bg-black selection:text-white">
      
      {/* JIKA BELUM PILIH: TAMPILAN CARD ELEGAN MEWAH */}
      {mode === 'choice' && (
        <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] shadow-2xl p-8 sm:p-12 max-w-xl w-full text-center space-y-8 relative overflow-hidden">
          
          {/* Aksen Garis Mewah di Atas */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-zinc-200 via-black to-zinc-200"></div>

          <div className="space-y-4 flex flex-col items-center">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">
              CLIENT CONCIERGE & SUPPORT
            </span>
            <h1 className="text-2xl font-black text-black tracking-tight uppercase">Pusat Layanan & Bantuan</h1>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-medium">
              Pilih jalur komunikasi eksklusif di bawah ini untuk terhubung langsung dengan tim workshop DSCPL WEAR.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Opsi 1: WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              className="group relative bg-zinc-50 hover:bg-black text-black hover:text-white border border-zinc-200 p-6 rounded-3xl flex flex-col items-center justify-center space-y-3 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer"
            >
              <div className="w-12 h-12 bg-white text-black group-hover:bg-zinc-900 group-hover:text-white rounded-2xl flex items-center justify-center text-lg shadow-md transition-transform duration-300 group-hover:scale-110 border border-zinc-100">
                🟢
              </div>
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider">WhatsApp Direct</h3>
                <p className="text-[10px] text-zinc-400 group-hover:text-zinc-400 mt-0.5">Respon Cepat via WA</p>
              </div>
            </a>

            {/* Opsi 2: Live Chat */}
            <button
              onClick={() => setMode('livechat')}
              className="group relative bg-black text-white hover:bg-zinc-800 p-6 rounded-3xl flex flex-col items-center justify-center space-y-3 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer"
            >
              <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center text-lg shadow-md transition-transform duration-300 group-hover:scale-110 border border-zinc-800">
                💬
              </div>
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Live Website Chat</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Real-time di sini</p>
              </div>
            </button>

          </div>

          <p className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
            Operational Hours: Mon - Sat (10:00 - 21:00 WIB)
          </p>
        </div>
      )}

      {/* JIKA PILIH LIVE CHAT: TAMPILAN RUANG CHAT PREMIUM */}
      {mode === 'livechat' && (
        <div className="bg-white border border-zinc-200/80 rounded-[2.5rem] shadow-2xl flex flex-col h-[650px] max-w-4xl w-full overflow-hidden animate-in fade-in duration-300">
          
          {/* Header Chat Mewah */}
          <div className="bg-black text-white px-6 py-5 flex justify-between items-center border-b border-zinc-800">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMode('choice')} 
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-xs text-zinc-300 hover:text-white transition cursor-pointer border border-zinc-800"
                title="Kembali"
              >
                ←
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-zinc-300">DSCPL Live Concierge</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">ROOM: <span className="text-white font-bold">{roomId}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
              <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Admin Online</span>
            </div>
          </div>

          {/* Riwayat & Daftar Pesan */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-50/60">
            {messages.length === 0 ? (
              <div className="text-center py-24 space-y-3">
                <div className="w-14 h-14 bg-black text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg text-lg">
                  ✦
                </div>
                <h3 className="font-extrabold text-xs text-black uppercase tracking-wider">Mulai Percakapan Eksklusif</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto font-medium">
                  Sampaikan pertanyaan seputar katalog, custom sablon DTF, atau detail pesanan Anda pada tim kami.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isCustomer = m.sender === 'customer'
                return (
                  <div key={idx} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-xs font-semibold ${
                      isCustomer 
                        ? 'bg-black text-white rounded-br-xs shadow-md' 
                        : 'bg-white border border-zinc-200 text-black shadow-sm rounded-bl-xs'
                    }`}>
                      <p className="text-[9px] font-bold tracking-wider uppercase opacity-50 mb-1">
                        {isCustomer ? 'Anda' : 'DSCPL Concierge'}
                      </p>
                      <p className="leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Kirim */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-zinc-200 flex gap-3 items-center">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ketik pesan Anda di sini..."
              className="flex-1 bg-zinc-50 border border-zinc-200 text-xs px-5 py-3.5 rounded-2xl focus:outline-none focus:border-black font-medium text-black transition"
            />
            <button
              type="submit"
              className="bg-black hover:bg-zinc-800 text-white text-xs font-black px-7 py-3.5 rounded-2xl uppercase tracking-wider transition cursor-pointer shadow-md hover:shadow-lg"
            >
              Kirim ➔
            </button>
          </form>

        </div>
      )}

    </main>
  )
}