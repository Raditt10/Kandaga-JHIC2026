import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Menunggu Verifikasi — KANDAGA",
  description: "Akun perusahaan Anda sedang ditinjau oleh Koordinator BKK SMKN 13 Bandung.",
};

export default function MitraMenungguPage() {
  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full bg-[#a61743] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden"
    >
      {/* Background Graphic Design: Diagonal rounded pills matching registration reference */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="whitePillBright" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.28" />
            </linearGradient>
            <linearGradient id="whitePillMedium" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="whitePillSoft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Top-Left Diagonal Rounded Pills */}
          <g transform="rotate(-35 250 200)">
            <rect x="-180" y="-140" width="130" height="640" rx="65" fill="url(#whitePillMedium)" />
            <rect x="0" y="-180" width="160" height="740" rx="80" fill="url(#whitePillBright)" />
            <rect x="210" y="-100" width="110" height="520" rx="55" fill="url(#whitePillMedium)" />
            <rect x="360" y="-50" width="75" height="380" rx="37.5" fill="url(#whitePillSoft)" />
          </g>

          {/* Bottom-Right Diagonal Rounded Pills */}
          <g transform="rotate(-35 1200 700)">
            <rect x="960" y="440" width="80" height="460" rx="40" fill="url(#whitePillSoft)" />
            <rect x="1080" y="340" width="130" height="620" rx="65" fill="url(#whitePillMedium)" />
            <rect x="1250" y="260" width="165" height="760" rx="82.5" fill="url(#whitePillBright)" />
            <rect x="1460" y="320" width="140" height="660" rx="70" fill="url(#whitePillMedium)" />
          </g>
        </svg>
      </div>

      {/* Main Floating Card */}
      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl bg-white rounded-3xl lg:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-white/40 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Status Information */}
        <div className="w-full flex flex-col justify-between py-2 sm:py-4">
          {/* Top Header: Back Link & Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              aria-label="Kembali ke Beranda"
              className="w-8 h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Menunggu Verifikasi BKK
            </span>
          </div>

          {/* Content Heading */}
          <div className="w-full max-w-[440px] mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Pendaftaran Berhasil!
            </h1>
            <p className="text-sm text-zinc-500 mt-2 mb-6 leading-relaxed">
              Akun perusahaan Anda sudah dibuat dan sedang menunggu verifikasi dari{" "}
              <strong className="text-zinc-800 font-semibold">Koordinator BKK SMKN 13 Bandung</strong>.
            </p>

            {/* Stepper / Timeline Card */}
            <div className="bg-zinc-50/80 rounded-2xl border border-zinc-200/80 p-4 sm:p-5 mb-5 space-y-3.5">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Langkah Selanjutnya
              </h2>

              <ol className="space-y-3">
                {[
                  {
                    no: "01",
                    done: true,
                    title: "Akun terdaftar",
                    desc: "Data perusahaan berhasil tersimpan di sistem Kandaga.",
                  },
                  {
                    no: "02",
                    done: false,
                    current: true,
                    title: "Tinjauan Koordinator BKK",
                    desc: "Tim BKK memeriksa kelengkapan data & profil industri (maks. 1×24 jam kerja).",
                  },
                  {
                    no: "03",
                    done: false,
                    title: "Notifikasi persetujuan",
                    desc: "Anda akan menerima email konfirmasi begitu akun disetujui.",
                  },
                  {
                    no: "04",
                    done: false,
                    title: "Akses katalog & talenta",
                    desc: "Login dan mulai rekrut siswa magang PKL atau portofolio terverifikasi.",
                  },
                ].map((s) => (
                  <li key={s.no} className="flex items-start gap-3 text-xs">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        s.done
                          ? "bg-emerald-100 text-emerald-700"
                          : s.current
                          ? "bg-[#a61743] text-white shadow-2xs"
                          : "bg-zinc-200 text-zinc-500"
                      }`}
                    >
                      {s.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        s.no
                      )}
                    </span>
                    <div>
                      <p
                        className={`font-semibold ${
                          s.done
                            ? "text-emerald-700"
                            : s.current
                            ? "text-[#a61743]"
                            : "text-zinc-800"
                        }`}
                      >
                        {s.title}
                      </p>
                      <p className="text-zinc-500 leading-relaxed mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Support / BKK Contact Box */}
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 text-xs text-zinc-600 mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-800 block text-[11px]">Ada kendala verifikasi?</span>
                  <a
                    href="mailto:bkk@smkn13bandung.sch.id"
                    className="text-[11px] text-[#a61743] hover:underline font-medium"
                  >
                    bkk@smkn13bandung.sch.id
                  </a>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100 shrink-0">
                08.00–15.00 WIB
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="py-2.5 px-4 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition text-center"
              >
                Kembali ke Beranda
              </Link>
              <Link
                href="/auth/login"
                className="flex-1 bg-[#242c4b] hover:bg-[#1a2038] text-white py-2.5 rounded-md text-xs font-semibold transition-colors duration-150 flex items-center justify-center gap-1.5 shadow-xs text-center"
              >
                Coba Masuk ke Akun
              </Link>
            </div>

            {/* Footer link */}
            <div className="text-center text-[11px] text-zinc-400 mt-5">
              Portal Kemitraan Industri SMKN 13 Bandung • Kandaga
            </div>
          </div>
        </div>

        {/* Right Column: Ilustrasi Mitra Perusahaan (company.webp) */}
        <div className="relative hidden lg:block w-full h-full min-h-[560px] rounded-2xl lg:rounded-[28px] overflow-hidden bg-[#7C0215]">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, #7C0215 0%, #8C051A 55%, #8F071C 100%)" }}
            aria-hidden="true"
          />

          <Image
            src="/images/company.webp"
            alt="Ilustrasi Mitra Industri dan Perusahaan"
            fill
            priority
            unoptimized
            sizes="(min-width: 1280px) 512px, 448px"
            className="object-cover object-center select-none"
            draggable={false}
          />
        </div>

      </div>
    </div>
  );
}
