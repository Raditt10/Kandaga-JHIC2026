"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  MessageSquare,
  X,
  Send,
  Minimize2,
  Trash2,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { QUICK_PROMPTS } from "@/lib/kandaga-knowledge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  source?: "gemini_api" | "local_knowledge_base"
}

/**
 * Logo resmi Kandaga AI sebagai badge bulat.
 *
 * Catatan teknis: `kala.webp` sebenarnya berkas PNG berlatar krem solid
 * (bukan transparan), dengan padding kosong cukup lebar di sekeliling mark.
 * Karena itu `object-cover` dipakai untuk memangkas keempat sudut latar lewat
 * mask bulat, lalu `scale-110` memangkas sisa padding agar huruf "K" tetap
 * terbaca jelas pada ukuran kecil (28-40px). Mark aslinya hanya menempati
 * ~62% lebar gambar, sehingga zoom 110% masih aman tanpa memotong logo.
 */
function KalaMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/kala.webp"
        alt="Logo KALA AI"
        width={size}
        height={size}
        sizes={`${size}px`}
        className="h-full w-full scale-110 object-cover"
      />
    </span>
  )
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Halo! 👋 Saya **KALA**, asisten AI resmi platform Kandaga SMKN 13 Bandung.\n\nAda yang bisa saya bantu terkait karya siswa, jurusan (**RPL, TKJ, Analis Kimia**), alur verifikasi guru, atau kemitraan industri & magang?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isLoading) return

    const userMsgId = `user-${Date.now()}`
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: text,
        timestamp: timeStr,
      },
    ]

    setMessages(newMessages)
    setInputValue("")
    setIsLoading(true)

    try {
      // Siapkan payload ke /api/chat
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi AI server.")
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply || "Maaf, saya tidak dapat merespons saat ini.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: data.source,
        },
      ])

      if (!isOpen) {
        setHasUnread(true)
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: "assistant",
          content:
            "⚠️ Maaf, terjadi kendala saat memproses jawaban. Silakan coba kembali sesaat lagi.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Percakapan telah diatur ulang. Ada yang ingin Anda tanyakan seputar portofolio atau jurusan di SMKN 13 Bandung?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
  }

  // Format rendering teks sederhana (bold, list, link)
  const formatMessageText = (content: string) => {
    const lines = content.split("\n")
    return lines.map((line, lineIdx) => {
      // Cek list bullet
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ")
      const formattedLine = line.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>")

      return (
        <p
          key={lineIdx}
          className={`${isBullet ? "pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-rose-500" : ""} ${
            line.trim() === "" ? "h-2" : "mb-1 leading-relaxed"
          }`}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      )
    })
  }

  return (
    <div className="fixed bottom-8 right-5 z-50 print:hidden font-sans flex flex-col items-end gap-3">
      {/* ────────────────── 1. CHAT POPUP WINDOW ────────────────── */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-7.5rem)] bg-white rounded-3xl shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header Bar — Marun Simple Solid */}
          <div className="bg-[#8B1A2F] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#731224] shrink-0">
            <div className="flex items-center gap-3">
              <KalaMark size={38} className="shadow-xs ring-2 ring-white/30 shrink-0" />
              <div className="flex flex-col">
                <h3 className="font-heading font-bold text-base tracking-wide text-white leading-tight">
                  Kala Assistant
                </h3>
                <span className="text-[11px] font-sans text-emerald-200/90 font-medium leading-none mt-1">
                  Online
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Hapus Percakapan"
                className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="bg-zinc-50 border-b border-zinc-200/80 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => handleSendMessage(prompt.query)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 hover:text-[#8B1A2F] hover:border-rose-300 text-zinc-600 font-medium border border-zinc-200 transition shadow-2xs cursor-pointer text-left"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9FA]/70">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant"
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <KalaMark size={28} className="mt-0.5 shadow-xs ring-1 ring-[#8B1A2F]/15" />
                  )}

                  <div className={`max-w-[85%] flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs ${
                        isAssistant
                          ? "bg-white text-zinc-800 border border-zinc-200/80 shadow-xs rounded-tl-xs"
                          : "bg-[#8B1A2F] text-white shadow-xs rounded-tr-xs"
                      }`}
                    >
                      <div className="text-xs leading-relaxed space-y-1">
                        {formatMessageText(msg.content)}
                      </div>

                      {msg.source === "local_knowledge_base" && (
                        <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                          <span>Knowledge Base SMKN 13</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-zinc-400 font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>


                </div>
              )
            })}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <KalaMark size={28} className="mt-0.5 shadow-xs ring-1 ring-[#8B1A2F]/15" />
                <div className="bg-white border border-zinc-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 ml-1">
                    KALA sedang berpikir...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-zinc-200 shrink-0">
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 focus-within:border-[#8B1A2F] focus-within:ring-2 focus-within:ring-rose-500/20 rounded-2xl px-3 py-1.5 transition">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanyakan apa saja seputar Kandaga..."
                disabled={isLoading}
                className="w-full bg-transparent text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden py-1.5"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                  inputValue.trim() && !isLoading
                    ? "bg-[#8B1A2F] text-white shadow-xs hover:bg-[#9E2037]"
                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                }`}
                aria-label="Kirim Pesan"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── 2. FLOATING CHAT TRIGGER / CLOSE BUTTON ────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#8B1A2F] hover:bg-[#9E2037] shadow-xl shadow-black/25 border-[3px] border-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
        aria-label={isOpen ? "Tutup chat" : "Buka asisten KALA"}
      >
        {isOpen ? (
          <X className="w-9 h-9 text-white stroke-[2.5]" />
        ) : (
          <>
            <KalaMark size={58} className="shadow-xs" />
            {hasUnread && (
              <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-emerald-500 text-white font-bold text-[11px] rounded-full flex items-center justify-center shadow-md">
                1
              </span>
            )}
          </>
        )}
      </button>
    </div>
  )
}
