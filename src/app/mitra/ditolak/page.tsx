"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { XCircle, Mail, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";

export default function MitraDitolakPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const isRejectedFlag =
      typeof window !== "undefined" &&
      sessionStorage.getItem("mitra_status_ditolak") === "true";

    const isRejectedCompany =
      status === "authenticated" &&
      session?.user?.role?.toLowerCase() === "company" &&
      session?.user?.verificationStatus === "ditolak";

    if (isRejectedFlag || isRejectedCompany) {
      setIsAllowed(true);
    } else if (status !== "loading") {
      setIsAllowed(false);
      router.replace("/auth/login");
    }
  }, [session, status, router]);

  if (isAllowed !== true) {
    return (
      <div className="min-h-screen w-full bg-[#a61743] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }
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

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Pendaftaran Tidak Disetujui
            </span>
          </div>

          {/* Content Heading */}
          <div className="w-full max-w-[440px] mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Pengajuan Belum Disetujui
            </h1>
            <p className="text-sm text-zinc-500 mt-2 mb-6 leading-relaxed">
              Setelah ditinjau oleh <strong className="text-zinc-800 font-semibold">Koordinator BKK SMKN 13 Bandung</strong>,
              pendaftaran kemitraan belum memenuhi kriteria kelengkapan data.
            </p>

            {/* Opsi Tindak Lanjut */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">
                    Hubungi Koordinator BKK
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    Kirim email untuk menanyakan detail kekurangan dokumen atau klarifikasi.
                  </p>
                  <a
                    href="mailto:bkk@smkn13bandung.sch.id?subject=Klarifikasi%20Pendaftaran%20Mitra%20Kandaga"
                    className="inline-block mt-1 text-xs font-semibold text-[#a61743] hover:underline"
                  >
                    bkk@smkn13bandung.sch.id
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800">
                    Daftar Ulang dengan Dokumen Lengkap
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    Pastikan profil perusahaan valid dan dokumen legalitas resmi terlampir dengan jelas.
                  </p>
                </div>
              </div>
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
                href="/mitra/daftar"
                className="flex-1 bg-[#242c4b] hover:bg-[#1a2038] text-white py-2.5 rounded-md text-xs font-semibold transition-colors duration-150 flex items-center justify-center gap-1.5 shadow-xs text-center"
              >
                Daftar Ulang Sekarang
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
