"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Mail,
  Lock,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type FormState = {
  namaKontak: string;
  email: string;
  password: string;
  konfirmasiPass: string;
  namaPerusahaan: string;
  bidang: string;
  dokumenUrl: string;
};

const INITIAL: FormState = {
  namaKontak: "",
  email: "",
  password: "",
  konfirmasiPass: "",
  namaPerusahaan: "",
  bidang: "",
  dokumenUrl: "",
};

const BIDANG_OPTIONS = [
  "Teknologi Informasi & Software",
  "Manufaktur & Rekayasa Industri",
  "Kimia, Farmasi & Laboratorium",
  "Telekomunikasi & Jaringan Komputer",
  "Pendidikan, Riset & Pelatihan",
  "Energi & Utilitas",
  "Konstruksi & Infrastruktur",
  "Lainnya",
];

export default function DaftarMitraPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const update =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const validateStep1 = () => {
    if (!form.namaKontak.trim()) return "Nama kontak wajib diisi.";
    if (!form.email.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Format email tidak valid.";
    if (form.password.length < 8) return "Password minimal 8 karakter.";
    if (form.password !== form.konfirmasiPass)
      return "Konfirmasi password tidak cocok.";
    return null;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaPerusahaan.trim()) {
      setError("Nama perusahaan wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/mitra/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaKontak: form.namaKontak,
          email: form.email,
          password: form.password,
          namaPerusahaan: form.namaPerusahaan,
          bidang: form.bidang || BIDANG_OPTIONS[0],
          dokumenUrl: form.dokumenUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      router.push("/mitra/menunggu");
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full bg-[#a61743] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden"
    >
      {/* Background Graphic Design: Diagonal rounded pills matching login reference */}
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
        
        {/* Left Column: Register Form */}
        <div className="w-full flex flex-col justify-between py-2 sm:py-4">
          {/* Top Header: Back Link */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              aria-label="Kembali ke Beranda"
              className="w-8 h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Step Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`px-2.5 py-1 rounded-full font-semibold transition ${
                  step === 1
                    ? "bg-[#a61743] text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                1. Akun
              </span>
              <span className="text-zinc-300">/</span>
              <span
                className={`px-2.5 py-1 rounded-full font-semibold transition ${
                  step === 2
                    ? "bg-[#a61743] text-white"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                2. Perusahaan
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-[420px] mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Daftar Mitra Industri
            </h1>
            <p className="text-sm text-zinc-500 mt-2 mb-6">
              {step === 1
                ? "Lengkapi informasi akun narahubung perwakilan perusahaan Anda."
                : "Lengkapi profil industri untuk verifikasi rekrutmen BKK."}
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Akun Narahubung */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Nama Narahubung <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.namaKontak}
                      onChange={update("namaKontak")}
                      placeholder="Nama lengkap perwakilan"
                      className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Email Resmi Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="hrd@perusahaan.co.id"
                      className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={update("password")}
                      placeholder="Minimal 8 karakter"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={form.konfirmasiPass}
                      onChange={update("konfirmasiPass")}
                      placeholder="Ulangi kata sandi"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#242c4b] hover:bg-[#1a2038] text-white py-3 rounded-md text-sm font-semibold transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-xs"
                >
                  <span>Lanjutkan ke Data Perusahaan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Data Perusahaan */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Nama Perusahaan / Instansi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.namaPerusahaan}
                    onChange={update("namaPerusahaan")}
                    placeholder="PT Telkom Indonesia, dsb."
                    className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Bidang Industri / Sektor
                  </label>
                  <select
                    value={form.bidang}
                    onChange={update("bidang")}
                    className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white cursor-pointer"
                  >
                    <option value="">Pilih Bidang Industri</option>
                    {BIDANG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Tautan Profil / Legalitas (Opsional)
                  </label>
                  <input
                    type="url"
                    value={form.dokumenUrl}
                    onChange={update("dokumenUrl")}
                    placeholder="https://perusahaan.co.id/profile atau link dokumen"
                    className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Bisa berupa link website profil perusahaan atau dokumen pengenal.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                    className="py-3 px-4 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-semibold transition cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#242c4b] hover:bg-[#1a2038] text-white py-3 rounded-md text-sm font-semibold transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer shadow-xs"
                  >
                    {loading ? "Mendaftarkan..." : "Selesaikan Pendaftaran"}
                  </button>
                </div>
              </form>
            )}

            {/* Account Login Links */}
            <div className="text-center text-xs text-zinc-500 mt-5 space-y-1.5">
              <p>
                Sudah memiliki akun mitra?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-[#a61743] underline underline-offset-2 hover:text-[#8B1A2F] transition"
                >
                  Masuk di sini
                </Link>
              </p>
              <p className="text-[11px] text-zinc-400">
                Pendaftaran siswa?{" "}
                <Link href="/auth/register" className="text-[#a61743] hover:underline font-medium transition">
                  Daftar sebagai siswa
                </Link>
              </p>
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
