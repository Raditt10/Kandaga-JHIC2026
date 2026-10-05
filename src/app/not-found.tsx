"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-zinc-800 flex items-center justify-center px-6 py-12 selection:bg-[#a61743]/15 selection:text-[#a61743]">
      <div className="max-w-md w-full text-center">
        {/* Angka 404 */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tight text-transparent bg-gradient-to-b from-zinc-900 via-[#4e0e20] to-[#a61743] bg-clip-text select-none leading-none">
          404
        </h1>

        {/* Judul & Penjelasan */}
        <h2 className="mt-4 text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          Halaman Tidak Ditemukan
        </h2>
        <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
          Halaman yang Anda tuju mungkin sudah dipindahkan, dihapus, atau tautan yang dimasukkan belum tepat.
        </p>

        {/* Tombol Aksi Simpel */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-semibold text-sm hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
            Kembali
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#a61743] text-white font-semibold text-sm hover:bg-[#8B1A2F] transition-all shadow-md shadow-[#a61743]/20"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
