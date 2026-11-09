'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function LiveChat({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Ambil riwayat chat lama
    const fetchChatHistory = async () => {
      const { data } = await supabase
        .from('chats')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }
    fetchChatHistory()

    // 2. Pasang Realtime Listener (Supabase Broadcast/Changes)
    const chatChannel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats', filter: `room_id=eq.${roomId}` },
        (payload) => {
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
    if (!inputMsg.trim()) return

    const { error } = await supabase.from('chats').insert([
      {
        room_id: roomId,
        sender: 'customer',
        message: inputMsg.trim()
      }
    ])

    if (!error) {
      setInputMsg('')
    }
  }

  return (
    <div className="flex flex-col h-[400px] bg-white border border-zinc-200 rounded-3xl shadow-lg overflow-hidden">
      <div className="bg-black text-white px-4 py-3 font-black text-xs uppercase tracking-wider">
        💬 Live Chat dengan Admin DSCPL
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50">
        {messages.map((m, idx) => {
          const isAdmin = m.sender === 'admin'
          return (
            <div key={idx} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-bold ${
                isAdmin ? 'bg-white border text-black shadow-sm' : 'bg-black text-white'
              }`}>
                <p className="text-[9px] opacity-60 mb-0.5">{isAdmin ? 'Admin DSCPL' : 'Anda'}</p>
                {m.message}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-zinc-200 flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 bg-zinc-100 text-xs px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-black font-semibold text-black"
        />
        <button type="submit" className="bg-black hover:bg-zinc-800 text-white text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider transition">
          Kirim
        </button>
      </form>
    </div>
  )
}