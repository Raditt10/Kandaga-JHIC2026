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
  Move,
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

/** Titik jangkar yang diizinkan: 4 sudut + 4 titik tengah tepi layar. */
type Anchor =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

const ANCHORS: Anchor[] = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
]

const BTN_SIZE = 76
/** Jarak tetap dari tepi layar (px). */
const EDGE = 24

/** Ubah sebuah jangkar menjadi koordinat piksel di dalam viewport. */
function anchorToPos(anchor: Anchor, vw: number, vh: number): { x: number; y: number } {
  const maxX = Math.max(EDGE, vw - BTN_SIZE - EDGE)
  const maxY = Math.max(EDGE, vh - BTN_SIZE - EDGE)
  const midX = Math.max(EDGE, Math.min(maxX, (vw - BTN_SIZE) / 2))
  const midY = Math.max(EDGE, Math.min(maxY, (vh - BTN_SIZE) / 2))

  switch (anchor) {
    case "top-left":
      return { x: EDGE, y: EDGE }
    case "top-center":
      return { x: midX, y: EDGE }
    case "top-right":
      return { x: maxX, y: EDGE }
    case "middle-left":
      return { x: EDGE, y: midY }
    case "middle-right":
      return { x: maxX, y: midY }
    case "bottom-left":
      return { x: EDGE, y: maxY }
    case "bottom-center":
      return { x: midX, y: maxY }
    case "bottom-right":
      return { x: maxX, y: maxY }
  }
}

/** Jangkar terdekat dari sebuah titik (dipakai saat widget dilepas setelah diseret). */
function nearestAnchor(x: number, y: number, vw: number, vh: number): Anchor {
  let best: Anchor = "bottom-right"
  let bestDist = Number.POSITIVE_INFINITY

  for (const a of ANCHORS) {
    const p = anchorToPos(a, vw, vh)
    const d = Math.hypot(p.x - x, p.y - y)
    if (d < bestDist) {
      bestDist = d
      best = a
    }
  }

  return best
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

  // Widget hanya boleh "menempel" pada salah satu dari 8 titik jangkar.
  // Saat diseret ia mengikuti kursor bebas (dragPos), lalu melompat ke
  // jangkar terdekat begitu dilepas (anchor).
  const [anchor, setAnchor] = useState<Anchor>("bottom-right")
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [viewport, setViewport] = useState({ w: 1280, h: 800 })
  const [mounted, setMounted] = useState(false)
  // Petunjuk "bisa dipindahkan" — tampil otomatis sekali saja untuk pengunjung baru.
  const [showMoveHint, setShowMoveHint] = useState(false)

  const dragStartRef = useRef<{
    startX: number
    startY: number
    btnX: number
    btnY: number
    hasMoved: boolean
  } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  /** Menyimpan posisi drag terbaru agar pelepasan pointer tidak memakai nilai state yang basi. */
  const dragPosRef = useRef<{ x: number; y: number } | null>(null)

  // Ukuran viewport dipantau agar jangkar selalu dihitung ulang saat jendela berubah.
  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  /*
   * Pulihkan jangkar terakhir yang dipilih pengguna, lalu tandai widget siap
   * tampil.
   *
   * `setMounted(true)` sengaja diletakkan di sini, bukan di efek viewport,
   * supaya render pertama yang menampilkan widget sudah memakai jangkar
   * tersimpan. Kalau tidak, widget sempat muncul di jangkar bawaan
   * (`bottom-right`) lebih dulu, lalu melompat ke posisi pilihan pengguna.
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kandaga_kala_anchor")
      if (saved && (ANCHORS as string[]).includes(saved)) {
        setAnchor(saved as Anchor)
      }
    } catch {}
    setMounted(true)
  }, [])

  /** Tandai petunjuk sudah pernah dilihat agar tidak muncul lagi. */
  const dismissMoveHint = () => {
    setShowMoveHint(false)
    try {
      localStorage.setItem("kandaga_kala_hint_seen", "1")
    } catch {}
  }

  // Tampilkan petunjuk "bisa dipindahkan" sekali saja, lalu sembunyikan sendiri.
  useEffect(() => {
    if (!mounted) return
    try {
      if (localStorage.getItem("kandaga_kala_hint_seen")) return
    } catch {
      return
    }

    const showTimer = setTimeout(() => setShowMoveHint(true), 1400)
    const hideTimer = setTimeout(() => dismissMoveHint(), 11000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [mounted])

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    // Pengguna menyentuh widget → petunjuk dianggap sudah terbaca.
    if (showMoveHint) dismissMoveHint()
    const rect = buttonRef.current?.getBoundingClientRect()
    const cur = dragPos ?? anchorToPos(anchor, viewport.w, viewport.h)

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      btnX: rect ? rect.left : cur.x,
      btnY: rect ? rect.top : cur.y,
      hasMoved: false,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStartRef.current
    if (!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY

    if (!drag.hasMoved && Math.hypot(dx, dy) > 4) {
      drag.hasMoved = true
      setIsDragging(true)
    }

    if (drag.hasMoved) {
      // Selama diseret widget bebas mengikuti kursor, tetap di dalam layar.
      const maxX = Math.max(EDGE, window.innerWidth - BTN_SIZE - EDGE)
      const maxY = Math.max(EDGE, window.innerHeight - BTN_SIZE - EDGE)
      const next = {
        x: Math.max(EDGE, Math.min(maxX, drag.btnX + dx)),
        y: Math.max(EDGE, Math.min(maxY, drag.btnY + dy)),
      }
      dragPosRef.current = next
      setDragPos(next)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStartRef.current
    if (!drag) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    const wasDragged = drag.hasMoved
    dragStartRef.current = null
    setIsDragging(false)

    if (wasDragged) {
      // Dilepas di titik mana pun → menempel ke jangkar terdekat, lalu disimpan.
      const released = dragPosRef.current ?? { x: drag.btnX, y: drag.btnY }
      const next = nearestAnchor(released.x, released.y, viewport.w, viewport.h)
      dragPosRef.current = null
      setDragPos(null)
      setAnchor(next)
      try {
        localStorage.setItem("kandaga_kala_anchor", next)
      } catch {}
    } else {
      setIsOpen((prev) => !prev)
    }
  }

  const handlePointerCancel = () => {
    dragStartRef.current = null
    dragPosRef.current = null
    setDragPos(null)
    setIsDragging(false)
  }

  const handleResetPosition = (e: React.MouseEvent) => {
    e.stopPropagation()
    dragPosRef.current = null
    setDragPos(null)
    setAnchor("bottom-right")
    try {
      localStorage.removeItem("kandaga_kala_anchor")
    } catch {}
  }

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

  // Posisi efektif: bebas mengikuti kursor saat diseret, selain itu tepat di jangkar.
  const pos = dragPos ?? anchorToPos(anchor, viewport.w, viewport.h)
  const vw = viewport.w
  const vh = viewport.h

  // Panel dibuka ke arah yang masih punya ruang lebih banyak.
  const spaceAbove = pos.y
  const spaceBelow = vh - (pos.y + BTN_SIZE)
  const openDown = spaceBelow >= spaceAbove

  const isMiddle = anchor === "middle-left" || anchor === "middle-right"
  const isCentered = anchor === "top-center" || anchor === "bottom-center"
  const onLeftHalf = pos.x + BTN_SIZE / 2 < vw / 2

  // Jangkar yang sedang disorot saat menyeret.
  const activeTarget = isDragging ? nearestAnchor(pos.x, pos.y, vw, vh) : anchor

  const panelMaxHeight = isMiddle
    ? Math.max(240, vh - EDGE * 2)
    : Math.max(240, (openDown ? spaceBelow : spaceAbove) - 12)

  const panelPlacement = isMiddle
    ? "top-1/2 -translate-y-1/2"
    : openDown
      ? "top-[calc(100%+12px)] slide-in-from-top-3"
      : "bottom-[calc(100%+12px)] slide-in-from-bottom-3"

  const panelAlignX = isCentered
    ? "left-1/2 -translate-x-1/2"
    : anchor.endsWith("left")
      ? "left-0"
      : "right-0"

  return (
    <div
      /*
       * `kala-light` = pulau terang. Widget ini sengaja tidak ikut tema gelap
       * (warna marunnya sudah jadi identitas tersendiri), jadi seluruh isinya
       * dipaksa kembali ke palet terang lewat aturan di globals.css.
       */
      /*
       * `invisible` selama posisi belum diketahui.
       *
       * Markup ini dirender server tanpa tahu ukuran viewport maupun jangkar
       * yang tersimpan di localStorage, jadi ia sempat dicat browser di posisi
       * bawaan `bottom-8 right-6` sebelum hidrasi dan efek pemulihan selesai —
       * itulah kedipan "pindah ke posisi default" yang terlihat saat refresh.
       *
       * Karena HTML server sudah dicat sebelum React hidup, satu-satunya cara
       * menghilangkan kedipan itu adalah tidak menampakkannya sejak awal.
       * Begitu `mounted` menyala, widget muncul langsung di jangkar yang benar.
       */
      className={`kala-light fixed z-50 print:hidden font-sans pointer-events-none select-none ${
        mounted ? "" : "bottom-8 right-6 invisible"
      } ${isDragging ? "" : "transition-[left,top] duration-300 ease-out"}`}
      style={mounted ? { left: pos.x, top: pos.y } : undefined}
    >
      {/* Bayangan 8 titik jangkar — hanya tampil saat widget sedang diseret.
          z-index negatif membuatnya berada di belakang tombol & panel. */}
      {isDragging && (
        <div className="pointer-events-none fixed inset-0 -z-10 print:hidden">
          {ANCHORS.map((a) => {
            const p = anchorToPos(a, vw, vh)
            const isActive = a === activeTarget
            return (
              <span
                key={a}
                style={{ left: p.x, top: p.y, width: BTN_SIZE, height: BTN_SIZE }}
                className={`absolute rounded-full border-2 border-dashed transition-all duration-150 ${
                  isActive
                    ? "border-[#8B1A2F] bg-[#8B1A2F]/10 scale-105"
                    : "border-zinc-400/50 bg-white/40"
                }`}
              />
            )
          })}
        </div>
      )}
      {/* ────────────────── 1. CHAT POPUP WINDOW ────────────────── */}
      {isOpen && (
        <div
          className={`absolute pointer-events-auto select-auto w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] bg-white rounded-3xl shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden animate-in fade-in duration-200 ${panelPlacement} ${panelAlignX}`}
          style={{ maxHeight: panelMaxHeight }}
        >
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
        ref={buttonRef}
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onDoubleClick={handleResetPosition}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen((prev) => !prev)
          }
        }}
        style={{ touchAction: "none" }}
        className={`pointer-events-auto group relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#8B1A2F] hover:bg-[#9E2037] border-[3px] border-white shrink-0 ${
          isDragging
            ? "cursor-grabbing scale-110 shadow-2xl shadow-black/35"
            : "cursor-pointer shadow-xl shadow-black/25 hover:scale-105 active:scale-95 transition-[transform,background-color,box-shadow] duration-150"
        }`}
        /* Catatan: atribut `title` sengaja tidak dipakai supaya tooltip bawaan
           browser tidak menumpuk di atas balon info milik widget. */
        aria-label={
          isOpen
            ? "Tutup chat KALA"
            : "Buka asisten KALA. Klik untuk membuka, seret untuk memindahkan ke sudut atau tepi layar, klik ganda untuk kembali ke kanan bawah."
        }
      >
        {isOpen ? (
          <X className="w-9 h-9 text-white stroke-[2.5] pointer-events-none" />
        ) : (
          <>
            {/* Balon info: sapaan + keterangan bahwa widget bisa dipindahkan.
                Muncul otomatis sekali untuk pengunjung baru, dan tetap muncul saat di-hover.
                Disembunyikan ketika widget sedang diseret atau panel sedang terbuka. */}
            {!isDragging && !isOpen && (
              <div
                className={`absolute top-1/2 -translate-y-1/2 pointer-events-none w-[264px] transition-all duration-300 ${
                  onLeftHalf ? "left-[calc(100%+14px)]" : "right-[calc(100%+14px)]"
                } ${
                  showMoveHint
                    ? "opacity-100 translate-x-0"
                    : `opacity-0 group-hover:opacity-100 group-hover:translate-x-0 ${
                        onLeftHalf ? "-translate-x-2" : "translate-x-2"
                      }`
                }`}
              >
                {/* Balon sapaan — satu-satunya elemen di dalam alur, sehingga
                    selalu tegak lurus dengan tombol dan panahnya tepat mengarah
                    ke tombol. Lebarnya dipatok agar teks tidak terpotong
                    per kata saat kontainer absolut menyusut. */}
                <div className="relative w-full bg-white text-zinc-800 rounded-2xl shadow-xl border border-zinc-200/90 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm leading-5">👋</span>
                    <span className="text-xs font-medium leading-snug">
                      Hai! Ada yang bisa KALA bantu?
                    </span>
                  </div>

                  {/* Segitiga panah ke arah tombol */}
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 ${
                      onLeftHalf
                        ? "-left-1.5 border-l border-b border-zinc-200/90"
                        : "-right-1.5 border-r border-t border-zinc-200/90"
                    }`}
                  />
                </div>

                {/* Balon info "bisa dipindahkan" — sengaja di luar alur agar tidak
                    menggeser balon sapaan. Diletakkan di sisi yang masih lapang:
                    di bawah bila tombol di paruh atas, di atas bila di paruh bawah. */}
                <div
                  className={`absolute w-full bg-[#8B1A2F] text-white rounded-2xl shadow-lg px-3.5 py-2 flex items-center gap-2 ${
                    openDown ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]"
                  }`}
                >
                  <span className="text-[11px] font-medium leading-snug">
                    Aku bisa dipindahkan, seret aku ke ke sudut layar ya!.
                  </span>
                </div>
              </div>
            )}

            <KalaMark size={58} className="shadow-xs pointer-events-none" />
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
