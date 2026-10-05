"use client";

/**
 * /company — Dashboard utama mitra perusahaan.
 *
 * Heading outline:
 *   h1: "Selamat Datang, {nama}!"
 *     h2: "Mulai dari Sini" (panel aksi cepat)
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CompanyLayout from "@/components/company/CompanyLayout";
import {
  Search, Bookmark, ClipboardList, User,
  ArrowRight, Clock, Send, CheckCircle2, FileSearch,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    href:    "/company/katalog",
    icon:    Search,
    label:   "Jelajahi Katalog Karya",
    desc:    "Temukan portofolio siswa terverifikasi dari 3 jurusan.",
    color:   "bg-blue-50 text-blue-700",
    primary: true,
  },
  {
    href:    "/company/tersimpan",
    icon:    Bookmark,
    label:   "Talenta Tersimpan",
    desc:    "Lihat karya yang sudah Anda bookmark.",
    color:   "bg-violet-50 text-violet-700",
    primary: false,
  },
  {
    href:    "/company/riwayat",
    icon:    ClipboardList,
    label:   "Riwayat Permintaan",
    desc:    "Pantau status ajuan minat rekrutmen & magang.",
    color:   "bg-amber-50 text-amber-700",
    primary: false,
  },
  {
    href:    "/company/profil",
    icon:    User,
    label:   "Lengkapi Profil",
    desc:    "Perbarui data perusahaan dan dokumen legalitas.",
    color:   "bg-emerald-50 text-emerald-700",
    primary: false,
  },
] as const;

type Ringkasan = {
  katalog: number | null;
  tersimpan: number | null;
  permintaan: number | null;
  diteruskan: number | null;
};

export default function CompanyDashboardPage() {
  const { data: session } = useSession();
  const companyName = session?.user?.name ?? "Mitra Industri";

  // Ringkasan angka dari database. Halaman ini sebelumnya tidak mengambil data
  // sama sekali — seluruh isinya statis.
  const [ringkasan, setRingkasan] = useState<Ringkasan>({
    katalog: null,
    tersimpan: null,
    permintaan: null,
    diteruskan: null,
  });
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let aktif = true;

    const ambilAngka = async () => {
      const [katalogRes, bookmarkRes, minatRes] = await Promise.all([
        fetch("/api/company/katalog?pageSize=1", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch("/api/company/bookmark", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch("/api/company/minat", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);

      if (!aktif) return;

      const items = Array.isArray(minatRes?.items) ? minatRes.items : [];
      setRingkasan({
        katalog: katalogRes?.pagination?.total ?? null,
        tersimpan: bookmarkRes?.total ?? null,
        permintaan: items.length,
        diteruskan: items.filter(
          (m: { status?: string }) => m.status === "diteruskan"
        ).length,
      });
      setMemuat(false);
    };

    ambilAngka();
    return () => {
      aktif = false;
    };
  }, []);

  const kartuRingkasan = [
    {
      label: "Katalog Karya Tersedia",
      value: ringkasan.katalog,
      hint: "Karya siswa yang sudah diverifikasi guru",
      icon: FileSearch,
      warna: "text-primary",
    },
    {
      label: "Karya Anda Simpan",
      value: ringkasan.tersimpan,
      hint: "Tersimpan untuk ditinjau lebih lanjut",
      icon: Bookmark,
      warna: "text-amber-600",
    },
    {
      label: "Permintaan Diajukan",
      value: ringkasan.permintaan,
      hint: "Seluruh permintaan yang pernah Anda kirim",
      icon: Send,
      warna: "text-blue-600",
    },
    {
      label: "Sudah Diteruskan BKK",
      value: ringkasan.diteruskan,
      hint: "Sudah dihubungkan ke siswa dan guru",
      icon: CheckCircle2,
      warna: "text-emerald-600",
    },
  ];

  return (
    <CompanyLayout>

      {/* ── Welcome banner ── */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-primary-dark to-primary text-white p-7 sm:p-9 relative overflow-hidden shadow-xl shadow-primary/15">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 max-w-xl pr-28 sm:pr-40 md:pr-0">
          <p className="text-xs font-mono text-white/50 mb-1 uppercase tracking-widest">
            Portal Mitra Industri
          </p>
          {/* h1 — satu-satunya di halaman ini */}
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {companyName}!
          </h1>
          <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-[60ch]">
            Anda memiliki akses ke katalog portofolio siswa SMKN 13 Bandung yang
            terverifikasi. Ajukan minat rekrutmen atau magang melalui jalur resmi BKK.
          </p>

          {/* Info singkat */}
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Layanan BKK: Senin–Jumat 08.00–15.00 WIB</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>Akun terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Model Chibi Mitra Perusahaan */}
        <div className="absolute right-1 sm:right-6 md:right-10 bottom-0 pointer-events-none select-none z-10">
          <div className="relative w-36 sm:w-48 md:w-56 lg:w-64 h-32 sm:h-44 md:h-52 lg:h-56">
            <Image
              src="/images/perusahaan.webp"
              alt="Ilustrasi Mitra Perusahaan"
              fill
              sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 256px"
              priority
              className="object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>
      </div>

      {/* ── Ringkasan angka dari database ── */}
      <div className="mb-8">
        <h2 className="font-heading text-lg font-semibold text-ink mb-5">
          Ringkasan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kartuRingkasan.map(({ label, value, hint, icon: Icon, warna }) => (
            <div
              key={label}
              className="rounded-2xl border border-ink-150 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold text-ink-600 uppercase tracking-wider">
                  {label}
                </span>
                <Icon className={`w-4 h-4 shrink-0 ${warna}`} aria-hidden="true" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-ink mt-3">
                {memuat || value === null ? "—" : value.toLocaleString("id-ID")}
              </p>
              <span className="text-xs text-ink-600 mt-1 block">{hint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="mb-2">
        <h2 className="font-heading text-lg font-semibold text-ink mb-5">
          Mulai dari Sini
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, color, primary }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col gap-3 rounded-2xl border p-5 transition-all hover:shadow-md ${
                primary
                  ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                  : "border-ink-150 bg-white hover:border-ink-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-heading text-sm font-semibold text-ink leading-snug">
                  {label}
                </p>
                <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                  {desc}
                </p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-0.5 ${
                primary ? "text-primary" : "text-ink-600"
              }`}>
                <span>Buka</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Info alur BKK ── */}
      <div className="mt-8 rounded-2xl border border-ink-150 bg-white p-5">
        <p className="text-sm font-semibold text-ink mb-2">
          Cara mengajukan minat rekrutmen
        </p>
        <ol className="space-y-1.5">
          {[
            "Jelajahi katalog karya siswa di menu 'Jelajahi Katalog'.",
            "Bookmark karya yang menarik perhatian Anda.",
            "Klik 'Ajukan Minat via BKK' pada karya pilihan.",
            "BKK akan meninjau dan meneruskan minat Anda ke siswa & guru.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <Link
          href="#cara-kerja-bkk"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Pelajari lebih lanjut cara kerja BKK
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

    </CompanyLayout>
  );
}
