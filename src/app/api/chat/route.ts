import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { KANDAGA_SYSTEM_INSTRUCTION } from "@/lib/kandaga-knowledge"

interface ChatMessage {
  role: "user" | "assistant" | "model"
  content: string
}

// Fallback cerdas berbasis pengetahuan lokal jika GEMINI_API_KEY belum dipasang
function getLocalFallbackResponse(userPrompt: string): string {
  const lower = userPrompt.toLowerCase()

  if (lower.includes("jurusan") || lower.includes("kompetensi") || lower.includes("keahlian")) {
    return `**SMKN 13 Bandung memiliki 3 Kompetensi Keahlian unggulan:**

1. **Rekayasa Perangkat Lunak (RPL)**
   - Fokus: Web & Mobile App Development (Next.js, Flutter, React), Database, UI/UX, dan Cloud.
   - Prospek: Software Engineer, Fullstack Web Developer, Mobile Developer.

2. **Teknik Komputer dan Jaringan (TKJ)**
   - Fokus: Network Infrastructure, MikroTik/Cisco Routing, Linux Server Administration, Cyber Security, dan IoT.
   - Prospek: Network Engineer, System Administrator, Cloud Specialist.

3. **Analis Kimia (AK)**
   - Fokus: Uji Laboratorium Kimia Terapan, Spektrofotometri UV-Vis, Kromatografi (HPLC/GC), Quality Assurance & Quality Control (QA/QC) standar ISO 17025.
   - Prospek: Quality Control Analyst, Laboran Kimia Industri, Research Assistant.

*Catatan: Sambungkan \`GEMINI_API_KEY\` di file \`.env\` untuk percakapan AI interaktif tanpa batas!*`
  }

  if (lower.includes("verifikasi") || lower.includes("kurasi") || lower.includes("unggah") || lower.includes("upload")) {
    return `**Alur Verifikasi Karya di Kandaga:**

1. **Unggah oleh Siswa**: Siswa login ke [/student](/student), buka menu **Karya Saya**, klik **+ Unggah Karya Baru**, lalu melampirkan dokumentasi, link demo/GitHub, dan teknologi yang dipakai.
2. **Review oleh Guru Pembimbing**: Guru di portal [/teacher](/teacher) akan memeriksa kelayakan karya dan memberikan penilaian (score) serta catatan revisi jika diperlukan.
3. **Persetujuan & Publikasi**: Setelah disetujui, karya otomatis tampil di **Galeri Karya Nasional** dan dapat dieksplorasi oleh mitra industri.

*Karya terverifikasi akan mendapatkan lencana resmi dari SMKN 13 Bandung.*`
  }

  if (lower.includes("magang") || lower.includes("industri") || lower.includes("perusahaan") || lower.includes("bkk") || lower.includes("pkl")) {
    return `**Kemitraan Industri & Magang di Kandaga:**

- **Mitra Perusahaan**: Dapat masuk melalui portal [/company](/company) untuk melihat katalog talenta siswa terkurasi dan membuka lowongan Praktik Kerja Lapangan (PKL).
- **Bursa Kerja Khusus (BKK)**: Memverifikasi legalitas MoU perusahaan di [/bkk](/bkk) dan menyalurkan alumni ke dunia kerja.
- **Siswa**: Dapat melamar langsung lowongan magang yang direkomendasikan melalui portal siswa.

Untuk kerjasama resmi, industri dapat menghubungi sekretariat BKK SMKN 13 Bandung.`
  }

  return `Halo! Saya **Kandaga AI Assistant** dari SMKN 13 Bandung. 

Saya siap membantu Anda seputar:
- Informasi 3 Jurusan (**RPL, TKJ, Analis Kimia**)
- Cara unggah dan verifikasi portofolio karya siswa
- Panduan kemitraan industri, PKL, dan BKK
- Tips portofolio kejuruan

*(Tips: Masukkan \`GEMINI_API_KEY\` Anda di file \`.env\` untuk mengaktifkan kecerdasan penuh model Google Gemini 2.5 Flash)*. Apa yang ingin Anda ketahui?`
}

/**
 * Pembatas laju sederhana per-IP (disimpan di memori proses).
 *
 * Endpoint ini memanggil GEMINI_API_KEY yang berbayar. Widget chat saat ini
 * tidak dipasang di halaman mana pun, TETAPI endpoint-nya tetap dapat
 * dijangkau langsung begitu situs live — jadi tanpa pembatas, siapa pun yang
 * tahu alamatnya bisa menghabiskan kuota API. Pembatas in-memory dipilih
 * (bukan wajib login) supaya widget tetap bisa dipakai pengunjung anonim
 * kalau nanti dipasang kembali.
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
        retryAfterSeconds: limit.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json()
    const { messages } = body as { messages?: ChatMessage[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    const apiKey = process.env.GEMINI_API_KEY

    // Jika API Key belum diset di .env, berikan jawaban fallback cerdas tanpa crash
    if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      const fallbackReply = getLocalFallbackResponse(lastMessage.content)
      return NextResponse.json({
        reply: fallbackReply,
        source: "local_knowledge_base",
        note: "GEMINI_API_KEY belum terpasang di .env. Menggunakan knowledge base lokal Kandaga.",
      })
    }

    // Hubungkan ke Google Gemini API menggunakan SDK @google/genai resmi
    const ai = new GoogleGenAI({ apiKey })

    // Format riwayat pesan untuk Gemini
    // Gemini SDK mengharapkan role 'user' atau 'model'
    const contents = messages.map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }))

    // Coba dengan model gemini-2.5-flash terlebih dahulu, fallback ke gemini-1.5-flash jika diperlukan
    let generatedText = ""
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: KANDAGA_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      })
      generatedText = response.text || ""
    } catch (modelError: any) {
      console.warn("Retrying with gemini-1.5-flash due to:", modelError?.message)
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contents,
        config: {
          systemInstruction: KANDAGA_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      })
      generatedText = fallbackResponse.text || ""
    }

    if (!generatedText) {
      generatedText = getLocalFallbackResponse(lastMessage.content)
    }

    return NextResponse.json({
      reply: generatedText,
      source: "gemini_api",
    })
  } catch (err: any) {
    console.error("Error in Kandaga Chat API:", err)
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat memproses jawaban AI.",
        details: err?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
