"use client";

/**
 * /company/profil — Profil & Metadata Perusahaan Mitra.
 *
 * Heading outline (design-rules §3):
 *   h1: Profil Perusahaan
 *     h2: Status Verifikasi & Legalitas
 *     h2: Informasi Akun Pendaftaran
 *     h2: Identitas & Profil Perusahaan
 *     h2: Domisili & Kontak Kantor
 *     h2: Kepatuhan Legalitas (NIB & NPWP)
 *     h2: Penanggung Jawab (PIC Industri)
 *     h2: Pratinjau Tinjauan BKK
 *
 * Fitur & Aturan:
 * - Menampilkan metadata lengkap perusahaan yang diverifikasi oleh BKK / Admin.
 * - Perusahaan dapat memperbarui profil operasional, legalitas, dan kontak mereka sendiri.
 * - Status verifikasi, verifikator, dan catatan penolakan adalah READ-ONLY (dilindungi DB trigger & API).
 * - Semua data dimuat dan disimpan melalui Prisma & PostgreSQL (tanpa mock local storage).
 * - Desain mematuhi design-rules: font-heading pada heading, line length max-w-[65ch], kontras WCAG AA.
 */

import { useCallback, useEffect, useState } from "react";
import CompanyLayout from "@/components/company/CompanyLayout";
import { useSession } from "next-auth/react";
import {
  Building2, Briefcase, FileText, ShieldCheck, CheckCircle2,
  AlertCircle, Loader2, Save, XCircle, Globe, Phone, MapPin,
  Calendar, Users, Mail, UserCheck, ExternalLink, RefreshCw, Eye,
  Sparkles, Check, HelpCircle
} from "lucide-react";

const BIDANG_OPTIONS = [
  "Teknologi Informasi & Software",
  "Telekomunikasi & Jaringan",
  "Kimia & Farmasi",
  "Manufaktur & Industri Otomasi",
  "Kreatif & Multimedia Digital",
  "Logistik & Rantai Pasok",
  "Pendidikan & Pelatihan",
  "Energi Terbarukan & Utilitas",
  "Konstruksi & Desain Arsitektur",
  "Lainnya",
];

const SKALA_OPTIONS = [
  "1-15 karyawan (Startup / Studio)",
  "16-50 karyawan (Usaha Menengah)",
  "51-200 karyawan (Perusahaan Berkembang)",
  "201-500 karyawan (Perusahaan Menengah-Besar)",
  "> 500 karyawan (Korporasi / Multinasional)",
];

type ProfilData = {
  namaKontak:         string;
  email:              string;
  terdaftarPada:      string;
  namaPerusahaan:     string;
  bidang:             string | null;
  deskripsi:          string | null;
  alamat:             string | null;
  kota:               string | null;
  provinsi:           string | null;
  telepon:            string | null;
  website:            string | null;
  nib:                string | null;
  npwp:               string | null;
  skalaKaryawan:      string | null;
  tahunBerdiri:       number | null;
  logoUrl:            string | null;
  picName:            string | null;
  picJabatan:         string | null;
  picEmail:           string | null;
  picPhone:           string | null;
  dokumenUrl:         string | null;
  verificationStatus: "pending" | "disetujui" | "ditolak" | string;
  verifiedBy:         string | null;
  verifiedAt:         string | null;
  catatanVerifikasi:  string | null;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeCls: string; icon: React.ElementType; desc: string }
> = {
  pending: {
    label: "Menunggu Verifikasi",
    badgeCls: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Loader2,
    desc: "Profil dan dokumen legalitas perusahaan Anda sedang berada dalam antrean tinjauan tim Koordinator BKK / Admin SMKN 13 Bandung.",
  },
  disetujui: {
    label: "Mitra Terverifikasi",
    badgeCls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: ShieldCheck,
    desc: "Perusahaan Anda telah resmi diverifikasi sebagai mitra industri SMKN 13 Bandung. Akses katalog talenta dan pengajuan minat kerja aktif.",
  },
  ditolak: {
    label: "Perlu Revisi / Ditolak",
    badgeCls: "bg-rose-50 text-rose-800 border-rose-200",
    icon: XCircle,
    desc: "Tinjauan verifikasi membutuhkan perbaikan kelengkapan berkas atau data profil. Harap tinjau catatan verifikator di bawah ini.",
  },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ProfilCompanyPage() {
  const { data: session } = useSession();
  const [profil, setProfil]     = useState<ProfilData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Form Fields State
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [bidang, setBidang]                 = useState("");
  const [deskripsi, setDeskripsi]           = useState("");
  const [alamat, setAlamat]                 = useState("");
  const [kota, setKota]                     = useState("");
  const [provinsi, setProvinsi]             = useState("");
  const [telepon, setTelepon]               = useState("");
  const [website, setWebsite]               = useState("");
  const [nib, setNib]                       = useState("");
  const [npwp, setNpwp]                     = useState("");
  const [skalaKaryawan, setSkalaKaryawan]   = useState("");
  const [tahunBerdiri, setTahunBerdiri]     = useState<string>("");
  const [logoUrl, setLogoUrl]               = useState("");
  const [picName, setPicName]               = useState("");
  const [picJabatan, setPicJabatan]         = useState("");
  const [picEmail, setPicEmail]             = useState("");
  const [picPhone, setPicPhone]             = useState("");
  const [dokumenUrl, setDokumenUrl]         = useState("");
  const [isDirty, setIsDirty]               = useState(false);

  const populateForm = (data: ProfilData) => {
    setNamaPerusahaan(data.namaPerusahaan ?? "");
    setBidang(data.bidang ?? "");
    setDeskripsi(data.deskripsi ?? "");
    setAlamat(data.alamat ?? "");
    setKota(data.kota ?? "");
    setProvinsi(data.provinsi ?? "");
    setTelepon(data.telepon ?? "");
    setWebsite(data.website ?? "");
    setNib(data.nib ?? "");
    setNpwp(data.npwp ?? "");
    setSkalaKaryawan(data.skalaKaryawan ?? "");
    setTahunBerdiri(data.tahunBerdiri ? String(data.tahunBerdiri) : "");
    setLogoUrl(data.logoUrl ?? "");
    setPicName(data.picName ?? "");
    setPicJabatan(data.picJabatan ?? "");
    setPicEmail(data.picEmail ?? "");
    setPicPhone(data.picPhone ?? "");
    setDokumenUrl(data.dokumenUrl ?? "");
    setIsDirty(false);
  };

  const fetchProfil = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company/profil");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memuat profil.");
        return;
      }
      setProfil(data);
      populateForm(data);
    } catch {
      setError("Kesalahan koneksi saat memuat profil perusahaan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfil();
  }, [fetchProfil]);

  // Deteksi perubahan form untuk indikator dirty
  useEffect(() => {
    if (!profil) return;
    const dirty =
      namaPerusahaan !== (profil.namaPerusahaan ?? "") ||
      bidang !== (profil.bidang ?? "") ||
      deskripsi !== (profil.deskripsi ?? "") ||
      alamat !== (profil.alamat ?? "") ||
      kota !== (profil.kota ?? "") ||
      provinsi !== (profil.provinsi ?? "") ||
      telepon !== (profil.telepon ?? "") ||
      website !== (profil.website ?? "") ||
      nib !== (profil.nib ?? "") ||
      npwp !== (profil.npwp ?? "") ||
      skalaKaryawan !== (profil.skalaKaryawan ?? "") ||
      tahunBerdiri !== (profil.tahunBerdiri ? String(profil.tahunBerdiri) : "") ||
      logoUrl !== (profil.logoUrl ?? "") ||
      picName !== (profil.picName ?? "") ||
      picJabatan !== (profil.picJabatan ?? "") ||
      picEmail !== (profil.picEmail ?? "") ||
      picPhone !== (profil.picPhone ?? "") ||
      dokumenUrl !== (profil.dokumenUrl ?? "");
    setIsDirty(dirty);
  }, [
    namaPerusahaan, bidang, deskripsi, alamat, kota, provinsi,
    telepon, website, nib, npwp, skalaKaryawan, tahunBerdiri,
    logoUrl, picName, picJabatan, picEmail, picPhone, dokumenUrl,
    profil
  ]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPerusahaan.trim() || namaPerusahaan.trim().length < 2) {
      setError("Nama perusahaan wajib diisi minimal 2 karakter.");
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        namaPerusahaan: namaPerusahaan.trim(),
        bidang: bidang.trim() || null,
        deskripsi: deskripsi.trim() || null,
        alamat: alamat.trim() || null,
        kota: kota.trim() || null,
        provinsi: provinsi.trim() || null,
        telepon: telepon.trim() || null,
        website: website.trim() || null,
        nib: nib.trim() || null,
        npwp: npwp.trim() || null,
        skalaKaryawan: skalaKaryawan.trim() || null,
        tahunBerdiri: tahunBerdiri ? parseInt(tahunBerdiri, 10) : null,
        logoUrl: logoUrl.trim() || null,
        picName: picName.trim() || null,
        picJabatan: picJabatan.trim() || null,
        picEmail: picEmail.trim() || null,
        picPhone: picPhone.trim() || null,
        dokumenUrl: dokumenUrl.trim() || null,
      };

      const res = await fetch("/api/company/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Gagal menyimpan perubahan profil.");
        return;
      }

      setSuccess("Profil perusahaan berhasil diperbarui dan tersimpan di database.");
      setIsDirty(false);
      // Refresh state lokal
      setProfil((prev) =>
        prev
          ? {
              ...prev,
              namaPerusahaan: payload.namaPerusahaan,
              bidang: payload.bidang,
              deskripsi: payload.deskripsi,
              alamat: payload.alamat,
              kota: payload.kota,
              provinsi: payload.provinsi,
              telepon: payload.telepon,
              website: payload.website,
              nib: payload.nib,
              npwp: payload.npwp,
              skalaKaryawan: payload.skalaKaryawan,
              tahunBerdiri: payload.tahunBerdiri,
              logoUrl: payload.logoUrl,
              picName: payload.picName,
              picJabatan: payload.picJabatan,
              picEmail: payload.picEmail,
              picPhone: payload.picPhone,
              dokumenUrl: payload.dokumenUrl,
            }
          : prev
      );
    } catch {
      setError("Terjadi kesalahan jaringan saat menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const statusConfig = profil ? (STATUS_CONFIG[profil.verificationStatus] ?? STATUS_CONFIG.pending) : STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  // Kelengkapan indikator metadata (skor kesiapan verifikasi)
  const checklist = [
    { label: "Nama & Bidang Perusahaan", checked: Boolean(namaPerusahaan && bidang) },
    { label: "Deskripsi Profil Singkat", checked: Boolean(deskripsi && deskripsi.length >= 20) },
    { label: "Alamat & Kontak Kantor", checked: Boolean(alamat && (kota || telepon)) },
    { label: "Nomor Induk Berusaha (NIB 13 Digit)", checked: Boolean(nib && nib.length >= 10) },
    { label: "URL Dokumen Legalitas OSS / SK", checked: Boolean(dokumenUrl) },
    { label: "Penanggung Jawab (PIC)", checked: Boolean(picName && (picEmail || picPhone)) },
  ];
  const completedCount = checklist.filter((c) => c.checked).length;
  const scorePercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <CompanyLayout pageTitle="Profil Perusahaan">
      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Profil Perusahaan
          </h1>
          <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
            Kelola identitas resmi, legalitas usaha, kontak kantor, dan person-in-charge
            (PIC) untuk verifikasi resmi oleh BKK SMKN 13 Bandung.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-ink-150 bg-white text-sm font-semibold text-ink-700 hover:bg-ink-100 hover:text-ink transition-colors shadow-xs"
          >
            <Eye className="w-4 h-4 text-ink-600" aria-hidden="true" />
            <span>Pratinjau Tinjauan BKK</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-ink-600">Memuat metadata profil perusahaan...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Section Status Verifikasi (Read-only Banner) ── */}
          <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs overflow-hidden relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border ${statusConfig.badgeCls} shrink-0`}>
                  <StatusIcon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-heading text-lg font-bold text-ink">
                      Status Verifikasi Kemitraan
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-bold ${statusConfig.badgeCls}`}>
                      <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">
                    {statusConfig.desc}
                  </p>

                  {profil?.verifiedBy && profil.verifiedAt && (
                    <p className="mt-2 text-xs text-ink-600 font-mono">
                      Diverifikasi oleh: <strong className="text-ink">{profil.verifiedBy}</strong> pada {formatDate(profil.verifiedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Kesesuaian Metadata */}
              <div className="md:border-l md:border-ink-150 md:pl-6 shrink-0 flex flex-col justify-center min-w-[200px]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-ink-700">Kelengkapan Berkas</span>
                  <span className="font-bold text-primary">{scorePercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      scorePercent === 100
                        ? "bg-emerald-500"
                        : scorePercent >= 60
                        ? "bg-primary"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
                <span className="text-xs text-ink-600 mt-1">
                  {completedCount} dari {checklist.length} parameter terisi
                </span>
              </div>
            </div>

            {/* Catatan Penolakan / Revisi dari BKK */}
            {profil?.verificationStatus === "ditolak" && profil.catatanVerifikasi && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-heading text-sm font-bold text-rose-900">
                      Catatan Perbaikan dari Tim BKK / Admin:
                    </h3>
                    <p className="mt-1 text-sm text-rose-800 leading-relaxed max-w-[65ch]">
                      {profil.catatanVerifikasi}
                    </p>
                    <p className="mt-2 text-xs text-rose-700">
                      Silakan sesuaikan data di formulir bawah ini dan klik &quot;Simpan Perubahan&quot; untuk mengajukan peninjauan kembali.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Status Feedback Banner ── */}
          {success && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-800 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Form Utama Edit Metadata ── */}
          <form onSubmit={handleSave} className="space-y-6">

            {/* Bagian 1: Identitas & Profil Bisnis */}
            <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-ink-150 pb-3">
                <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Identitas & Profil Perusahaan</span>
                </h2>
                <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">
                  Informasi nama resmi, bidang industri, deskripsi operasional, serta representasi visual instansi Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nama Perusahaan */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Nama Resmi Perusahaan / Instansi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaPerusahaan}
                    onChange={(e) => setNamaPerusahaan(e.target.value)}
                    placeholder="Contoh: PT Sintesis Digital Nusantara"
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    required
                  />
                  <p className="mt-1 text-xs text-ink-600">Gunakan nama badan hukum resmi (PT/CV/Firma/Yayasan) sesuai dokumen legalitas.</p>
                </div>

                {/* Bidang Industri */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Bidang Usaha / Sektor Industri
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                    <select
                      value={bidang}
                      onChange={(e) => setBidang(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none"
                    >
                      <option value="">— Pilih sektor industri —</option>
                      {BIDANG_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Skala Karyawan */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Skala Perusahaan (Jumlah Karyawan)
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                    <select
                      value={skalaKaryawan}
                      onChange={(e) => setSkalaKaryawan(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none"
                    >
                      <option value="">— Pilih skala karyawan —</option>
                      {SKALA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tahun Berdiri */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Tahun Berdiri
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                    <input
                      type="number"
                      min={1900}
                      max={new Date().getFullYear()}
                      value={tahunBerdiri}
                      onChange={(e) => setTahunBerdiri(e.target.value)}
                      placeholder="Contoh: 2018"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* Website Resmi */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Website Resmi / Portofolio
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://company.co.id"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-primary transition"
                        title="Buka website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Logo Perusahaan (URL) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Logo Resmi Perusahaan (URL Gambar)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-16 h-16 rounded-2xl border border-ink-150 bg-ink-100/50 flex items-center justify-center overflow-hidden shrink-0">
                      {logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "";
                          }}
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-ink-300" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... atau https://domain.com/logo.png"
                        className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                      <p className="mt-1 text-xs text-ink-600">
                        Gunakan tautan gambar HTTPS dengan latar belakang transparan atau putih (PNG/WebP/SVG).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deskripsi Perusahaan */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Deskripsi Ringkas Perusahaan & Fokus Bisnis
                  </label>
                  <textarea
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Jelaskan secara ringkas kegiatan utama industri, layanan, bidang keahlian yang relevan dengan siswa SMK, dan komitmen kemitraan..."
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-y"
                  />
                  <p className="mt-1 text-xs text-ink-600">
                    Teks ini akan dibaca oleh tim BKK dan siswa saat mengevaluasi profil mitra industri.
                  </p>
                </div>
              </div>
            </div>

            {/* Bagian 2: Alamat & Kontak Kantor */}
            <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-ink-150 pb-3">
                <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Domisili & Kontak Kantor</span>
                </h2>
                <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">
                  Alamat operasional kantor pusat atau kantor cabang tempat penempatan magang / verifikasi domisili.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Alamat Lengkap Kantor
                  </label>
                  <textarea
                    rows={2}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan..."
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Contoh: Kota Bandung"
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value)}
                    placeholder="Contoh: Jawa Barat"
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Nomor Telepon Kantor / Layanan Resmi
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                    <input
                      type="tel"
                      value={telepon}
                      onChange={(e) => setTelepon(e.target.value)}
                      placeholder="+62 22 7564120 atau (022) 1234567"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 3: Legalitas & Kepatuhan Usaha (NIB, NPWP, Dokumen OSS) */}
            <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-ink-150 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span>Kepatuhan Legalitas (NIB & NPWP)</span>
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Wajib Ditinjau BKK
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">
                  Data identifikasi hukum dari sistem OSS (Online Single Submission) Republik Indonesia yang digunakan verifikator untuk memastikan keaslian badan usaha.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NIB */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Nomor Induk Berusaha (NIB 13 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={nib}
                    onChange={(e) => setNib(e.target.value)}
                    placeholder="Contoh: 9120304918291"
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm font-mono text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <p className="mt-1 text-xs text-ink-600">Nomor registrasi resmi izin usaha dari BKPM/OSS.</p>
                </div>

                {/* NPWP */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    NPWP Badan Perusahaan
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    placeholder="Contoh: 01.345.678.9-422.000"
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm font-mono text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <p className="mt-1 text-xs text-ink-600">Nomor Pokok Wajib Pajak atas nama badan hukum perusahaan.</p>
                </div>

                {/* Dokumen URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    URL Berkas Legalitas / SK Kemenkumham / NIB (Tautan Cloud / Drive)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                    <input
                      type="url"
                      value={dokumenUrl}
                      onChange={(e) => setDokumenUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... atau https://dropbox.com/..."
                      className="w-full pl-10 pr-24 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                    {dokumenUrl && (
                      <a
                        href={dokumenUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ink-100 hover:bg-ink-200 text-xs font-semibold text-ink-700 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka</span>
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-600">
                    Pastikan tautan berkas dapat diakses (akses lihat publik atau untuk tim verifikator).
                  </p>
                </div>
              </div>
            </div>

            {/* Bagian 4: Penanggung Jawab / PIC Kemitraan */}
            <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-ink-150 pb-3">
                <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Penanggung Jawab (PIC Industri / HRD)</span>
                </h2>
                <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">
                  Pejabat narahubung yang berwenang menandatangani surat perjanjian magang, koordinasi teknis, atau wawancara siswa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Nama Lengkap PIC
                  </label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="Contoh: Raden Arya Pratama, S.Kom."
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Jabatan PIC
                  </label>
                  <input
                    type="text"
                    value={picJabatan}
                    onChange={(e) => setPicJabatan(e.target.value)}
                    placeholder="Contoh: HR Director / Talent Acquisition Lead"
                    className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Email Resmi PIC
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                    <input
                      type="email"
                      value={picEmail}
                      onChange={(e) => setPicEmail(e.target.value)}
                      placeholder="pic.hrd@company.co.id"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    Nomor WhatsApp / Kontak Langsung PIC
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" aria-hidden="true" />
                    <input
                      type="tel"
                      value={picPhone}
                      onChange={(e) => setPicPhone(e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 5: Akun Pendaftaran (Read-only System Info) */}
            <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-4">
              <div className="border-b border-ink-150 pb-3">
                <h2 className="font-heading text-base font-bold text-ink">
                  Informasi Akun Pendaftaran
                </h2>
                <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">
                  Data kredensial pengguna yang terdaftar pada sistem autentikasi Kandaga.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3.5 rounded-2xl bg-ink-100/50 border border-ink-150">
                  <p className="text-xs font-mono text-ink-600 mb-1">Nama Akun Pendaftar</p>
                  <p className="font-semibold text-ink">{session?.user?.name ?? profil?.namaKontak ?? "—"}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-ink-100/50 border border-ink-150">
                  <p className="text-xs font-mono text-ink-600 mb-1">Email Login Terdaftar</p>
                  <p className="font-semibold text-ink font-mono truncate">{session?.user?.email ?? profil?.email ?? "—"}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-ink-100/50 border border-ink-150">
                  <p className="text-xs font-mono text-ink-600 mb-1">Tanggal Terdaftar</p>
                  <p className="font-semibold text-ink">{profil?.terdaftarPada ? formatDate(profil.terdaftarPada) : "—"}</p>
                </div>
              </div>
              <p className="text-xs text-ink-600">
                Email pendaftaran dan peran akun terlindungi oleh sistem keamanan dan tidak dapat diubah langsung dari formulir ini.
              </p>
            </div>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-ink-150 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-ink-700">
                {isDirty ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Ada perubahan belum disimpan
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                    <Check className="w-3.5 h-3.5" />
                    Data profil telah tersinkronisasi
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isDirty && (
                  <button
                    type="button"
                    onClick={() => {
                      if (profil) populateForm(profil);
                      setError("");
                      setSuccess("");
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-ink-150 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
                  >
                    Batalkan
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" aria-hidden="true" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* ── Modal Pratinjau Tinjauan BKK / Verifikator ── */}
      {showPreviewModal && profil && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowPreviewModal(false)}
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-ink-150 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-5 border-b border-ink-150 flex items-center justify-between bg-ink-100/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-heading text-base font-bold text-ink">
                  Simulasi Tampilan Verifikator BKK / Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink-100 hover:bg-ink-200 text-ink-700 transition"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl border border-ink-150 bg-ink-100/50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-7 h-7 text-ink-300" />
                  )}
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-ink">
                    {namaPerusahaan || "Nama Perusahaan Belum Diisi"}
                  </h4>
                  <p className="text-xs text-ink-600 font-mono mt-0.5">
                    {bidang || "Sektor Industri Belum Dipilih"} • {kota || "Lokasi Kota Belum Diisi"}
                  </p>
                  <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full border text-xs font-bold ${statusConfig.badgeCls}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Ringkasan Parameter */}
              <div className="rounded-2xl border border-ink-150 bg-ink-100/30 p-4 space-y-2">
                <p className="text-xs font-bold text-ink uppercase tracking-wider">
                  Checklist Kepatuhan Verifikator:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {item.checked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className={item.checked ? "text-ink-700" : "text-ink-600 line-through"}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata Preview */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl border border-ink-150">
                  <span className="font-mono text-ink-600 block">NIB OSS</span>
                  <span className="font-bold text-ink text-sm font-mono mt-0.5">{nib || "—"}</span>
                </div>
                <div className="p-3 rounded-xl border border-ink-150">
                  <span className="font-mono text-ink-600 block">NPWP Perusahaan</span>
                  <span className="font-bold text-ink text-sm font-mono mt-0.5">{npwp || "—"}</span>
                </div>
                <div className="p-3 rounded-xl border border-ink-150">
                  <span className="font-mono text-ink-600 block">Penanggung Jawab (PIC)</span>
                  <span className="font-semibold text-ink text-sm mt-0.5">{picName || "—"} ({picJabatan || "HRD"})</span>
                </div>
                <div className="p-3 rounded-xl border border-ink-150">
                  <span className="font-mono text-ink-600 block">Kontak WhatsApp PIC</span>
                  <span className="font-semibold text-ink text-sm font-mono mt-0.5">{picPhone || "—"}</span>
                </div>
              </div>

              {dokumenUrl && (
                <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900">Berkas Legalitas Terunggah</span>
                  </div>
                  <a
                    href={dokumenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    <span>Buka Tautan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
