"use client";

/**
 * Heading outline (design-rules.md §3):
 *   h1: "Daftar Sebagai Mitra Industri"
 *     h2: (tidak perlu — form adalah satu kesatuan)
 *
 * Design-rules yang diterapkan:
 * - font-heading pada semua judul (§1)
 * - text-base untuk label, text-sm tidak pernah di bawah 12px (§2)
 * - max-w-[65ch] pada deskripsi (§4)
 * - Tidak ada nested card ganda (§6)
 * - Kontras ink-700 untuk teks deskriptif (§7)
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2, User, Mail, Lock, Briefcase,
  FileText, Eye, EyeOff, AlertCircle,
  CheckCircle2, ArrowRight, ChevronRight,
} from "lucide-react";

type FormState = {
  namaKontak:     string;
  email:          string;
  password:       string;
  konfirmasiPass: string;
  namaPerusahaan: string;
  bidang:         string;
  dokumenUrl:     string; // mock — diisi string URL atau dikosongkan
};

const INITIAL: FormState = {
  namaKontak:     "",
  email:          "",
  password:       "",
  konfirmasiPass: "",
  namaPerusahaan: "",
  bidang:         "",
  dokumenUrl:     "",
};

const BIDANG_OPTIONS = [
  "Teknologi Informasi",
  "Manufaktur & Industri",
  "Kimia & Farmasi",
  "Telekomunikasi & Jaringan",
  "Pendidikan & Pelatihan",
  "Energi & Utilitas",
  "Konstruksi & Infrastruktur",
  "Lainnya",
];

export default function DaftarMitraPage() {
  const router = useRouter();
  const [form, setForm]         = useState<FormState>(INITIAL);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [step, setStep]         = useState<1 | 2>(1); // 2 langkah form

  const update = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // ── Validasi step 1 sebelum lanjut ──────────────────────────────────
  const validateStep1 = () => {
    if (!form.namaKontak.trim()) return "Nama kontak wajib diisi.";
    if (!form.email.trim())      return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Format email tidak valid.";
    if (form.password.length < 8) return "Password minimal 8 karakter.";
    if (form.password !== form.konfirmasiPass)
      return "Konfirmasi password tidak cocok.";
    return null;
  };

  const handleNextStep = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  // ── Submit ke API ────────────────────────────────────────────────────
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
          namaKontak:    form.namaKontak,
          email:         form.email,
          password:      form.password,
          namaPerusahaan: form.namaPerusahaan,
          bidang:        form.bidang,
          dokumenUrl:    form.dokumenUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal. Coba lagi.");
        setLoading(false);
        return;
      }

      // Sukses → halaman menunggu verifikasi
      router.push("/mitra/menunggu");
    } catch {
      setError("Terjadi kesalahan koneksi. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F6] via-white to-cream flex flex-col">

      {/* ── Mini navbar ─────────────────────────────────────────────── */}
      <header className="w-full pt-6 px-4 z-20">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md border border-ink-150 shadow-sm rounded-full px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 relative rounded-full overflow-hidden ring-1 ring-ink/5">
              <Image src="/logo.png" alt="Kandaga" fill sizes="32px" className="object-contain" priority />
            </div>
            <span className="font-heading font-extrabold text-base bg-gradient-to-r from-ink via-primary to-primary bg-clip-text text-transparent">
              KANDAGA
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/mitra/cara-kerja-bkk" className="text-ink-600 hover:text-ink transition hidden sm:block">
              Cara Kerja BKK
            </Link>
            <Link href="/auth/login" className="rounded-full border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-white transition">
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* ── Konten utama ────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-semibold mb-3">
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              Mitra Industri &amp; DUDI
            </div>
            {/* h1 — satu-satunya heading utama */}
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Daftar Sebagai Mitra Industri
            </h1>
            <p className="mt-2 text-base text-ink-700 max-w-[65ch] mx-auto leading-relaxed">
              Akses katalog portofolio siswa terverifikasi dan hubungkan kebutuhan
              rekrutmen Anda melalui jalur resmi BKK SMKN 13 Bandung.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { no: 1, label: "Akun" },
              { no: 2, label: "Perusahaan" },
            ].map(({ no, label }, i) => (
              <div key={no} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  step === no
                    ? "bg-primary text-white"
                    : step > no
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-ink-100 text-ink-600"
                }`}>
                  {step > no
                    ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    : <span>{no}</span>}
                  <span>{label}</span>
                </div>
                {i < 1 && <ChevronRight className="w-4 h-4 text-ink-300" aria-hidden="true" />}
              </div>
            ))}
          </div>

          {/* Card form */}
          <div className="bg-white/95 rounded-3xl border border-ink-150 shadow-sm p-6 sm:p-8">

            {/* Error banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ── STEP 1: Data akun ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <p className="text-sm font-semibold text-ink-600 mb-1">Data Akun Perusahaan</p>

                  {/* Nama kontak */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Nama Narahubung <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
                      <input
                        type="text"
                        value={form.namaKontak}
                        onChange={update("namaKontak")}
                        placeholder="Nama lengkap Anda"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Email Perusahaan <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={update("email")}
                        placeholder="nama@perusahaan.co.id"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={update("password")}
                        placeholder="Minimal 8 karakter"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600"
                        aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi password */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Konfirmasi Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.konfirmasiPass}
                        onChange={update("konfirmasiPass")}
                        placeholder="Ulangi password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        autoComplete="new-password"
                      />
                    </div>
                    {form.password && form.konfirmasiPass && form.password !== form.konfirmasiPass && (
                      <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        Password tidak cocok
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
                  >
                    Lanjut ke Data Perusahaan
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* ── STEP 2: Data perusahaan ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <p className="text-sm font-semibold text-ink-600 mb-1">Data Perusahaan</p>

                  {/* Nama perusahaan */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Nama Perusahaan <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
                      <input
                        type="text"
                        value={form.namaPerusahaan}
                        onChange={update("namaPerusahaan")}
                        placeholder="PT / CV / Nama Instansi"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>
                  </div>

                  {/* Bidang usaha */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Bidang Usaha
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                      <select
                        value={form.bidang}
                        onChange={update("bidang")}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition appearance-none"
                      >
                        <option value="">Pilih bidang usaha (opsional)</option>
                        {BIDANG_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dokumen legalitas — mock */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Dokumen Legalitas
                      <span className="ml-2 text-xs font-normal text-ink-300">(NIB / NPWP / SK — opsional saat ini)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
                      <input
                        type="url"
                        value={form.dokumenUrl}
                        onChange={update("dokumenUrl")}
                        placeholder="https://drive.google.com/... (URL dokumen)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-ink-300">
                      Sementara dapat diisi URL Google Drive / Dropbox yang bisa diakses BKK.
                      Upload langsung akan tersedia di pembaruan berikutnya.
                    </p>
                  </div>

                  {/* Info verifikasi */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <p className="text-xs text-ink-700 leading-relaxed">
                      <span className="font-semibold text-primary">Setelah mendaftar:</span> akun Anda akan
                      masuk ke antrian verifikasi Koordinator BKK SMKN 13 Bandung. Proses ini berlangsung
                      maksimal <strong>1×24 jam kerja</strong>. Anda akan menerima notifikasi melalui email
                      setelah diverifikasi.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(""); }}
                      className="flex-1 rounded-full border border-ink-150 py-3.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors"
                    >
                      {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                      {!loading && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-ink-600">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Masuk ke portal
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
