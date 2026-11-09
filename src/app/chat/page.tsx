'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function CustomerChatPage() {
  const [roomId, setRoomId] = useState('')
  const [joined, setJoined] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Buat atau ambil Room ID otomatis dari localStorage saat pertama kali buka
  useEffect(() => {
    let savedRoom = localStorage.getItem('dscpl_chat_room')
    if (!savedRoom) {
      savedRoom = 'DSCPL-' + Math.floor(100000 + Math.random() * 900000)
      localStorage.setItem('dscpl_chat_room', savedRoom)
    }
    setRoomId(savedRoom)
    setJoined(true)
  }, [])

  // Ambil riwayat chat & pasang Real-time listener
  useEffect(() => {
    if (!roomId) return

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
  }, [roomId])

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
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm flex flex-col h-[600px] overflow-hidden">
          
          {/* Header Chat */}
          <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider">💬 Live Chat dengan Admin DSCPL WEAR</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">Room ID Anda: <span className="font-mono font-bold text-white">{roomId}</span></p>
            </div>
            <span className="bg-green-500 w-2.5 h-2.5 rounded-full animate-pulse" title="Online"></span>
          </div>

          {/* Daftar Pesan */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-50/50">
            {messages.length === 0 ? (
              <div className="text-center py-20 space-y-2">
                <span className="text-3xl">👋</span>
                <p className="text-xs text-zinc-400 font-semibold">Halo! Ada yang bisa kami bantu mengenai pesanan atau custom baju Anda?</p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isCustomer = m.sender === 'customer'
                return (
                  <div key={idx} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs font-bold ${
                      isCustomer ? 'bg-black text-white rounded-br-none' : 'bg-white border border-zinc-200 text-black shadow-sm rounded-bl-none'
                    }`}>
                      <p className="text-[9px] opacity-60 mb-1">{isCustomer ? 'Anda' : 'Admin DSCPL'}</p>
                      <p className="leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Kirim Pesan */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-zinc-200 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ketik pesan atau pertanyaan ke admin..."
              className="flex-1 bg-zinc-50 border border-zinc-200 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-black font-semibold text-black"
            />
            <button
              type="submit"
              className="bg-black hover:bg-zinc-800 text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow"
            >
              Kirim ➔
            </button>
          </form>

        </div>
      </main>
    </div>
  )
}