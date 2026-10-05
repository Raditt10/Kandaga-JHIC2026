"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Minimize2,
  Bot,
  User,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { QUICK_PROMPTS } from "@/lib/kandaga-knowledge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  source?: "gemini_api" | "local_knowledge_base"
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Halo! 👋 Saya **Kandaga AI**, asisten virtual resmi SMKN 13 Bandung.\n\nAda yang bisa saya bantu terkait karya siswa, jurusan (**RPL, TKJ, Analis Kimia**), alur verifikasi guru, atau kemitraan industri & magang?",
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
    <div className="fixed bottom-5 right-5 z-50 print:hidden font-sans">
      {/* ────────────────── 1. FLOATING CHAT TRIGGER BUTTON ────────────────── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-[#8B1A2F] via-[#751125] to-[#5a091a] text-white pl-4 pr-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
          aria-label="Buka Chatbot Kandaga AI"
        >
          {/* Glowing pulse aura */}
          <span className="absolute -inset-0.5 rounded-full bg-rose-500/40 blur-xs group-hover:opacity-100 opacity-60 transition duration-300 animate-pulse" />

          <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
          </div>

          <div className="relative flex flex-col text-left">
            <span className="font-heading font-extrabold text-xs tracking-tight leading-none text-white flex items-center gap-1.5">
              Tanya Kandaga AI
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            </span>
            <span className="text-[10px] text-rose-200/80 font-mono tracking-wider block mt-0.5">
              Gemini 2.5 Assistant
            </span>
          </div>

          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-black font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-xs">
              1
            </span>
          )}
        </button>
      )}

      {/* ────────────────── 2. CHAT POPUP WINDOW ────────────────── */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Bar (Maroon Palette) */}
          <div className="bg-gradient-to-r from-[#180308] via-[#2a050e] to-[#8B1A2F] text-white p-4 flex items-center justify-between border-b border-[#3d0b17] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5 text-rose-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#180308] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-black text-sm tracking-tight text-white leading-none">
                    Kandaga AI
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] font-mono text-rose-200 font-bold border border-white/10">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] text-rose-200/70 font-mono tracking-wider mt-1">
                  Virtual Assistant SMKN 13
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Mulai Ulang Chat"
                className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="bg-zinc-50 border-b border-zinc-200/80 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-zinc-400 font-mono shrink-0 pl-1 uppercase tracking-wider">
              Cepat:
            </span>
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
                    <div className="w-7 h-7 rounded-xl bg-[#8B1A2F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  )}

                  <div className={`max-w-[85%] flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs ${
                        isAssistant
                          ? "bg-white text-zinc-800 border border-zinc-200/80 shadow-xs rounded-tl-xs"
                          : "bg-gradient-to-r from-[#8B1A2F] to-[#a61743] text-white shadow-md rounded-tr-xs"
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

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-zinc-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#8B1A2F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="bg-white border border-zinc-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 ml-1">
                    Kandaga AI sedang berpikir...
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
                    ? "bg-[#8B1A2F] text-white shadow-xs hover:bg-[#a61743]"
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
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[10px] text-zinc-400 font-mono">
                Powered by Google Gemini
              </span>
              <span className="text-[10px] text-zinc-400">
                Tekan <kbd className="bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded text-[9px] font-mono">Enter</kbd> untuk kirim
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
