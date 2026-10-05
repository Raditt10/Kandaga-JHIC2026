"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-zinc-800 flex flex-col justify-between selection:bg-[#a61743]/15 selection:text-[#a61743]">
      {/* Header Navigasi Sederhana */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-zinc-900/5 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="Logo Kandaga"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#a61743] bg-clip-text text-transparent">
            KANDAGA
          </span>
        </Link>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-[#a61743] border border-rose-100">
          Galeri Portofolio SMKN 13 Bandung
        </span>
      </header>

      {/* Konten Utama 404 */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center">
          {/* Badge 404 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-xs font-bold text-[#a61743] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#a61743] animate-pulse" />
            Error 404 &bull; Halaman Tidak Ditemukan
          </div>

          {/* Angka 404 Besar */}
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-transparent bg-gradient-to-b from-zinc-900 via-[#4e0e20] to-[#a61743] bg-clip-text select-none leading-none">
            404
          </h1>

          {/* Judul & Penjelasan */}
          <h2 className="mt-4 text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Sepertinya halaman ini tidak tersedia
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-zinc-600 leading-relaxed max-w-md mx-auto">
            Halaman yang Anda tuju mungkin sudah dipindahkan, dihapus, atau tautan yang dimasukkan belum tepat.
          </p>

          {/* Tombol Aksi */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-semibold text-sm hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-500" />
              Kembali
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#a61743] text-white font-semibold text-sm hover:bg-[#8B1A2F] transition-all shadow-md shadow-[#a61743]/20"
            >
              <Home className="w-4 h-4" />
              Ke Beranda
            </Link>

            <Link
              href="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/60 text-[#a61743] font-semibold text-sm hover:bg-rose-50 transition-all"
            >
              <Compass className="w-4 h-4" />
              Jelajahi Karya
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} Kandaga &bull; SMK Negeri 13 Bandung. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
