"use client";

/**
 * /bkk/mitra/[id] — Halaman Verifikasi & Profil Lengkap Perusahaan Mitra.
 *
 * Diperuntukkan bagi BKK dan Admin yang berwenang meninjau, menyetujui,
 * atau menolak verifikasi profil dan dokumen legalitas perusahaan.
 *
 * Heading outline (design-rules §3):
 *   h1: Verifikasi & Profil Mitra Industri
 *     h2: Ringkasan Status & Aksi Verifikasi
 *     h2: Validasi Legalitas & Kepatuhan Usaha (NIB & NPWP)
 *     h2: Profil Operasional & Domisili Kantor
 *     h2: Penanggung Jawab Industri (PIC)
 *     h2: Rekam Jejak & Aktivitas Platform
 */

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BKKLayout from "@/components/bkk/BKKLayout";
import {
  Building2, ShieldCheck, CheckCircle2, XCircle, AlertCircle,
  ExternalLink, Globe, Phone, MapPin, Calendar, Users, Mail,
  UserCheck, ArrowLeft, Loader2, FileText, Bookmark, Send,
  Clock, RefreshCw
} from "lucide-react";

type CompanyDetail = {
  userId:             string;
  namaKontak:         string;
  email:              string;
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
  status:             "pending" | "disetujui" | "ditolak" | string;
  catatanVerifikasi:  string | null;
  verifiedBy:         string | null;
  verifiedAt:         string | null;
  terdaftarPada:      string;
  statistik: {
    totalPermintaanKontak: number;
    totalKaryaTersimpan:   number;
  };
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeCls: string; icon: React.ElementType }
> = {
  pending: {
    label: "Menunggu Verifikasi",
    badgeCls: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Clock,
  },
  disetujui: {
    label: "Mitra Disetujui",
    badgeCls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  ditolak: {
    label: "Pengajuan Ditolak",
    badgeCls: "bg-rose-50 text-rose-800 border-rose-200",
    icon: XCircle,
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

export default function DetailMitraPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // Modal aksi tolak / revisi
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [catatanTolak, setCatatanTolak]       = useState("");
  const [actionLoading, setActionLoading]     = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bkk/mitra/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memuat detail profil mitra.");
        return;
      }
      setCompany(data);
    } catch {
      setError("Kesalahan koneksi saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleAction = async (action: "setujui" | "tolak" | "pending") => {
    if (action === "tolak" && (!catatanTolak.trim() || catatanTolak.trim().length < 10)) {
      setError("Alasan penolakan / catatan revisi wajib diisi minimal 10 karakter.");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/bkk/mitra/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, catatan: catatanTolak.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memproses verifikasi.");
        return;
      }

      setSuccess(data.message ?? "Status verifikasi berhasil diperbarui.");
      setShowRejectModal(false);
      setCatatanTolak("");

      // Update state data lokal
      setCompany((prev) =>
        prev
          ? {
              ...prev,
              status:            data.data.status,
              verifiedBy:        data.data.verifiedBy,
              verifiedAt:        data.data.verifiedAt,
              catatanVerifikasi: data.data.catatanVerifikasi,
            }
          : prev
      );
    } catch {
      setError("Terjadi kesalahan jaringan saat memperbarui status verifikasi.");
    } finally {
      setActionLoading(false);
    }
  };

  const statusConfig = company ? (STATUS_CONFIG[company.status] ?? STATUS_CONFIG.pending) : STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <BKKLayout pageTitle="Detail & Verifikasi Profil Mitra">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/bkk/mitra"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kembali ke Manajemen Mitra</span>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Verifikasi & Profil Mitra Industri
          </h1>
          <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
            Tinjau kepatuhan dokumen legalitas, nomor NIB, profil operasional, dan narahubung
            sebelum menyetujui kemitraan sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/bkk/verifikasi"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-ink-150 bg-white text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Antrian Verifikasi</span>
          </Link>
        </div>
      </div>

      {/* ── Feedback Messages ── */}
      {success && (
        <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-ink-600">Memuat rincian metadata perusahaan...</p>
        </div>
      ) : !company ? (
        <div className="rounded-3xl border-2 border-dashed border-ink-150 p-12 text-center bg-white">
          <Building2 className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <h2 className="font-heading text-lg font-bold text-ink">Perusahaan Tidak Ditemukan</h2>
          <p className="text-sm text-ink-600 mt-1 max-w-[65ch] mx-auto">
            Data perusahaan dengan ID tersebut tidak ditemukan pada database Kandaga.
          </p>
          <div className="mt-4">
            <Link
              href="/bkk/mitra"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition"
            >
              Kembali ke Daftar Mitra
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Section Header Perusahaan & Panel Keputusan Aksi ── */}
          <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              {/* Logo & Identitas Singkat */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl border border-ink-150 bg-ink-100/50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {company.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={company.logoUrl}
                      alt={company.namaPerusahaan}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-ink-300" aria-hidden="true" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink">
                      {company.namaPerusahaan}
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-bold ${statusConfig.badgeCls}`}>
                      <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-sm text-ink-600 font-medium">
                    {company.bidang ?? "Bidang Industri Tidak Ditentukan"} • Terdaftar {formatDate(company.terdaftarPada)}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-ink-600 pt-1 flex-wrap font-mono">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-ink-400" />
                      {company.email}
                    </span>
                    {company.telepon && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-ink-400" />
                        {company.telepon}
                      </span>
                    )}
                    {company.kota && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-ink-400" />
                        {company.kota}, {company.provinsi ?? "Indonesia"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons (Wewenang Verifikasi BKK / Admin) */}
              <div className="border-t lg:border-t-0 lg:border-l border-ink-150 pt-4 lg:pt-0 lg:pl-6 shrink-0 flex flex-col gap-2.5 min-w-[240px]">
                <p className="text-xs font-mono text-ink-600 uppercase tracking-wider">
                  Keputusan Verifikator:
                </p>

                {company.status === "pending" ? (
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAction("setujui")}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-xs disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Setujui Kemitraan</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setShowRejectModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak / Minta Revisi</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-ink-100/50 border border-ink-150 text-xs">
                      <span className="font-semibold text-ink block">Status Saat Ini:</span>
                      <p className="text-ink-700 mt-0.5">
                        {company.status === "disetujui"
                          ? `Disetujui oleh ${company.verifiedBy ?? "Koordinator"} pada ${company.verifiedAt ? formatDate(company.verifiedAt) : "—"}`
                          : `Ditolak pada ${company.verifiedAt ? formatDate(company.verifiedAt) : "—"}`}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {company.status === "ditolak" ? (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleAction("setujui")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ubah Jadi Disetujui</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => setShowRejectModal(true)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Batalkan Persetujuan</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleAction("pending")}
                        className="px-3 py-2 rounded-full border border-ink-150 hover:bg-ink-100 text-ink-700 text-xs font-semibold transition"
                        title="Kembalikan ke antrean pending"
                      >
                        Reset Antrean
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Catatan Penolakan Terdaftar */}
            {company.status === "ditolak" && company.catatanVerifikasi && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-heading text-sm font-bold text-rose-900">
                      Catatan Penolakan / Revisi yang Diberikan:
                    </h3>
                    <p className="mt-1 text-sm text-rose-800 leading-relaxed max-w-[65ch]">
                      {company.catatanVerifikasi}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Grid 2 Kolom: Validasi Legalitas & Profil ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Kolom Kiri (2 Kolom): Legalitas & Profil Usaha */}
            <div className="lg:col-span-2 space-y-6">

              {/* Card 1: Validasi Legalitas & Kepatuhan Usaha (NIB & NPWP) */}
              <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-ink-150 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
                      <span>Validasi Legalitas & Kepatuhan Usaha</span>
                    </h2>
                    <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">
                      Pemeriksaan instrumen hukum badan usaha sesuai regulasi perizinan terintegrasi OSS RI.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Kepatuhan BKK
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* NIB */}
                  <div className="p-4 rounded-2xl border border-ink-150 bg-ink-100/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-ink-600">Nomor Induk Berusaha (NIB)</span>
                      {company.nib ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terisi
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-500">Belum Ada</span>
                      )}
                    </div>
                    <p className="text-base font-bold font-mono text-ink">
                      {company.nib ?? "—"}
                    </p>
                    <p className="text-xs text-ink-600">Identitas berusaha dari BKPM / OSS RI.</p>
                  </div>

                  {/* NPWP */}
                  <div className="p-4 rounded-2xl border border-ink-150 bg-ink-100/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-ink-600">NPWP Badan Perusahaan</span>
                      {company.npwp ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terisi
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-500">Belum Ada</span>
                      )}
                    </div>
                    <p className="text-base font-bold font-mono text-ink">
                      {company.npwp ?? "—"}
                    </p>
                    <p className="text-xs text-ink-600">NPWP wajib pajak badan usaha resmi.</p>
                  </div>
                </div>

                {/* Berkas Legalitas */}
                <div className="rounded-2xl border border-ink-150 p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">Tautan Dokumen Legalitas (NIB / SK / Izin Usaha)</p>
                      <p className="text-xs text-ink-600 mt-0.5 truncate max-w-[360px]">
                        {company.dokumenUrl ?? "Tidak ada tautan dokumen diunggah oleh perusahaan."}
                      </p>
                    </div>
                  </div>

                  {company.dokumenUrl ? (
                    <a
                      href={company.dokumenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition shrink-0"
                    >
                      <span>Buka & Periksa Berkas</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-rose-600 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 shrink-0">
                      Dokumen Belum Diunggah
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Profil Operasional & Domisili Kantor */}
              <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-ink-150 pb-3">
                  <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span>Profil Operasional & Domisili Kantor</span>
                  </h2>
                  <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">
                    Uraian kegiatan operasional, skala organisasi, dan domisili kantor tempat penempatan magang siswa.
                  </p>
                </div>

                {/* Deskripsi */}
                <div>
                  <h3 className="text-xs font-mono text-ink-600 mb-1">Deskripsi Singkat Perusahaan:</h3>
                  <div className="p-4 rounded-2xl bg-ink-100/30 border border-ink-150 text-sm text-ink leading-relaxed">
                    {company.deskripsi ? (
                      <p className="max-w-[65ch] whitespace-pre-line">{company.deskripsi}</p>
                    ) : (
                      <p className="text-ink-400 italic">Perusahaan belum mengisi uraian deskripsi profil.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-2">
                  <div className="p-3.5 rounded-2xl border border-ink-150 bg-white">
                    <span className="text-xs font-mono text-ink-600 block">Tahun Berdiri</span>
                    <span className="font-bold text-ink text-base block mt-0.5">
                      {company.tahunBerdiri ? `${company.tahunBerdiri} (${new Date().getFullYear() - company.tahunBerdiri} thn)` : "—"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-ink-150 bg-white">
                    <span className="text-xs font-mono text-ink-600 block">Skala Karyawan</span>
                    <span className="font-bold text-ink text-sm block mt-0.5">
                      {company.skalaKaryawan ?? "—"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-ink-150 bg-white">
                    <span className="text-xs font-mono text-ink-600 block">Website Resmi</span>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs mt-1 truncate max-w-[160px]"
                      >
                        <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-xs text-ink-400 block mt-1">—</span>
                    )}
                  </div>
                </div>

                {/* Alamat Lengkap */}
                <div className="p-4 rounded-2xl bg-ink-100/30 border border-ink-150 text-sm space-y-1">
                  <span className="text-xs font-mono text-ink-600 block">Alamat Kantor Operasional:</span>
                  <p className="font-semibold text-ink">
                    {company.alamat ?? "Alamat belum dilengkapi oleh perusahaan."}
                  </p>
                  {(company.kota || company.provinsi) && (
                    <p className="text-xs text-ink-600">
                      {company.kota ? `${company.kota}, ` : ""}{company.provinsi ?? ""}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Kolom Kanan (1 Kolom): PIC & Platform Metrics */}
            <div className="space-y-6">

              {/* Card 3: Penanggung Jawab (PIC Industri) */}
              <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-ink-150 pb-3">
                  <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span>Penanggung Jawab (PIC)</span>
                  </h2>
                  <p className="mt-1 text-xs text-ink-600">
                    Narahubung utama perwakilan industri untuk koordinasi kemitraan BKK.
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="p-3.5 rounded-2xl bg-ink-100/40 border border-ink-150">
                    <span className="text-xs font-mono text-ink-600 block">Nama Pejabat PIC</span>
                    <span className="font-bold text-ink block mt-0.5">
                      {company.picName ?? "—"}
                    </span>
                    <span className="text-xs text-ink-600 block mt-0.5 font-medium">
                      {company.picJabatan ?? "Jabatan belum ditentukan"}
                    </span>
                  </div>

                  {company.picEmail && (
                    <a
                      href={`mailto:${company.picEmail}`}
                      className="p-3 rounded-2xl border border-ink-150 hover:border-primary/40 bg-white flex items-center justify-between text-xs transition group"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-ink-400 group-hover:text-primary transition" />
                        <span className="font-mono text-ink truncate max-w-[180px]">{company.picEmail}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-300" />
                    </a>
                  )}

                  {company.picPhone && (
                    <a
                      href={`https://wa.me/${company.picPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between text-xs text-emerald-900 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold font-mono">{company.picPhone}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">Hubungi WA</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Card 4: Rekam Jejak Platform */}
              <div className="rounded-3xl border border-ink-150 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-ink-150 pb-3">
                  <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span>Rekam Jejak Platform</span>
                  </h2>
                  <p className="mt-1 text-xs text-ink-600">
                    Aktivitas interaksi mitra dengan karya talenta siswa SMKN 13.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-ink-100/40 border border-ink-150 text-center">
                    <Send className="w-5 h-5 text-primary mx-auto mb-1" />
                    <span className="text-xl font-extrabold text-ink block">
                      {company.statistik.totalPermintaanKontak}
                    </span>
                    <span className="text-xs text-ink-600 font-medium">Permintaan Kontak</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-ink-100/40 border border-ink-150 text-center">
                    <Bookmark className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <span className="text-xl font-extrabold text-ink block">
                      {company.statistik.totalKaryaTersimpan}
                    </span>
                    <span className="text-xs text-ink-600 font-medium">Karya Disimpan</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-ink-100/30 border border-ink-150 text-xs text-ink-600">
                  <p>
                    Akun terhubung ke login: <strong className="text-ink">{company.namaKontak}</strong> ({company.email})
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Modal Penolakan / Permintaan Revisi ── */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowRejectModal(false)}
        >
          <div className="w-full max-w-lg bg-white rounded-3xl border border-ink-150 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-ink-150 bg-rose-50/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-heading text-base font-bold text-rose-950">
                  Tolak atau Minta Revisi Berkas Mitra
                </h3>
              </div>
              <p className="mt-1 text-xs text-rose-800">
                Sertakan alasan yang jelas dan petunjuk perbaikan agar perusahaan dapat memperbarui data profilnya.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Catatan Verifikator BKK / Admin <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={catatanTolak}
                  onChange={(e) => setCatatanTolak(e.target.value)}
                  placeholder="Contoh: Dokumen NIB yang dilampirkan belum mencakup KBLI bidang software dan masa berlaku SK Kemenkumham belum diperbarui. Harap perbarui dokumen..."
                  className="w-full px-4 py-3 rounded-xl border border-ink-150 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition resize-none"
                />
                <p className={`mt-1 text-xs ${catatanTolak.trim().length >= 10 ? "text-emerald-600" : "text-ink-600"}`}>
                  {catatanTolak.trim().length}/10 karakter minimum yang diperlukan.
                </p>
              </div>

              <div className="rounded-xl border border-ink-150 bg-ink-100/30 p-3 text-xs text-ink-600">
                Catatan ini akan langsung ditampilkan pada dashboard perusahaan mitra dan dikirimkan sebagai notifikasi resmi peninjauan.
              </div>
            </div>

            <div className="px-6 py-4 border-t border-ink-150 bg-ink-100/20 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setCatatanTolak("");
                }}
                className="flex-1 px-4 py-2.5 rounded-full border border-ink-150 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition"
              >
                Batalkan
              </button>

              <button
                type="button"
                disabled={actionLoading || catatanTolak.trim().length < 10}
                onClick={() => handleAction("tolak")}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold transition shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                <span>Konfirmasi Tolak</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </BKKLayout>
  );
}
