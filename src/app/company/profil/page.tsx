"use client";

/**
 * /company/profil — Edit profil perusahaan.
 *
 * Sesuai alurMitra.md §2 & §8:
 * - Nama perusahaan, bidang usaha, dokumen URL → bisa diedit
 * - Status verifikasi → READ-ONLY (tidak bisa diubah dari sini)
 *
 * Heading outline:
 *   h1: "Profil Perusahaan"
 *     h2: "Informasi Akun" (read-only)
 *     h2: "Data Perusahaan" (form edit)
 */

import { useCallback, useEffect, useState } from "react";
import CompanyLayout from "@/components/company/CompanyLayout";
import { useSession } from "next-auth/react";
import {
  Building2, Briefcase, FileText, ShieldCheck,
  CheckCircle2, AlertCircle, Loader2, Save, XCircle,
} from "lucide-react";

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

type ProfilData = {
  namaKontak:         string;
  email:              string;
  terdaftarPada:      string;
  namaPerusahaan:     string;
  bidang:             string | null;
  dokumenUrl:         string | null;
  verificationStatus: string;
  catatanVerifikasi:  string | null;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "Menunggu Verifikasi", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Loader2 },
  disetujui: { label: "Disetujui",           color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: ShieldCheck },
  ditolak:   { label: "Tidak Disetujui",     color: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircle },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function ProfilPage() {
  const { data: session } = useSession();
  const [profil, setProfil]   = useState<ProfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [bidang, setBidang]                 = useState("");
  const [dokumenUrl, setDokumenUrl]         = useState("");
  const [isDirty, setIsDirty]               = useState(false);

  const fetchProfil = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/company/profil");
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal memuat."); return; }
      setProfil(data);
      // Isi form dengan nilai awal dari DB
      setNamaPerusahaan(data.namaPerusahaan ?? "");
      setBidang(data.bidang ?? "");
      setDokumenUrl(data.dokumenUrl ?? "");
    } catch { setError("Kesalahan koneksi."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfil(); }, [fetchProfil]);

  // Deteksi perubahan
  useEffect(() => {
    if (!profil) return;
    const dirty =
      namaPerusahaan !== (profil.namaPerusahaan ?? "") ||
      bidang         !== (profil.bidang ?? "") ||
      dokumenUrl     !== (profil.dokumenUrl ?? "");
    setIsDirty(dirty);
  }, [namaPerusahaan, bidang, dokumenUrl, profil]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPerusahaan.trim()) { setError("Nama perusahaan tidak boleh kosong."); return; }
    setError(""); setSuccess(""); setSaving(true);
    try {
      const res  = await fetch("/api/company/profil", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ namaPerusahaan, bidang: bidang || null, dokumenUrl: dokumenUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal menyimpan."); return; }
      setSuccess("Profil berhasil diperbarui.");
      setProfil((p) => p ? { ...p, namaPerusahaan, bidang: bidang || null, dokumenUrl: dokumenUrl || null } : p);
      setIsDirty(false);
    } catch { setError("Kesalahan koneksi."); }
    finally { setSaving(false); }
  };

  const statusInfo = profil ? (STATUS_MAP[profil.verificationStatus] ?? STATUS_MAP.pending) : null;
  const StatusIcon = statusInfo?.icon ?? ShieldCheck;

  return (
    <CompanyLayout pageTitle="Profil Perusahaan">

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
          Profil Perusahaan
        </h1>
        <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
          Kelola data perusahaan dan dokumen legalitas Anda.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-ink-300 animate-spin" aria-hidden="true" />
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">

          {/* ── Informasi Akun (read-only) ── */}
          <div className="rounded-2xl border border-ink-150 bg-white p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-ink">
              Informasi Akun
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono text-ink-600 mb-1">Nama narahubung</p>
                <p className="text-sm font-semibold text-ink">{session?.user?.name ?? profil?.namaKontak ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-ink-600 mb-1">Email</p>
                <p className="text-sm font-semibold text-ink font-mono truncate">{session?.user?.email ?? profil?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-ink-600 mb-1">Terdaftar sejak</p>
                <p className="text-sm text-ink">{profil?.terdaftarPada ? formatDate(profil.terdaftarPada) : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-ink-600 mb-1">Status verifikasi BKK</p>
                {statusInfo && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusInfo.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {statusInfo.label}
                  </span>
                )}
              </div>
            </div>

            {/* Catatan penolakan (jika ditolak) */}
            {profil?.verificationStatus === "ditolak" && profil.catatanVerifikasi && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs font-semibold text-rose-700 mb-1">Catatan dari BKK:</p>
                <p className="text-sm text-rose-800 leading-relaxed max-w-[65ch]">
                  {profil.catatanVerifikasi}
                </p>
              </div>
            )}

            <p className="text-xs text-ink-300">
              Nama narahubung, email, dan status verifikasi tidak dapat diubah dari halaman ini.
            </p>
          </div>

          {/* ── Form edit data perusahaan ── */}
          <form onSubmit={handleSave} className="rounded-2xl border border-ink-150 bg-white p-6 space-y-5">
            <h2 className="font-heading text-base font-semibold text-ink">
              Data Perusahaan
            </h2>

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {success}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Nama perusahaan */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Nama Perusahaan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
                <input
                  type="text"
                  value={namaPerusahaan}
                  onChange={(e) => setNamaPerusahaan(e.target.value)}
                  placeholder="PT / CV / Nama Instansi"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  required
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
                  value={bidang}
                  onChange={(e) => setBidang(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition appearance-none"
                >
                  <option value="">— Pilih bidang usaha (opsional) —</option>
                  {BIDANG_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dokumen legalitas */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Dokumen Legalitas
                <span className="ml-2 text-xs font-normal text-ink-300">(NIB / NPWP / SK — URL Google Drive / Dropbox)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
                <input
                  type="url"
                  value={dokumenUrl}
                  onChange={(e) => setDokumenUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-150 text-sm bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>
              {profil?.dokumenUrl && (
                <p className="mt-1.5 text-xs text-ink-600">
                  Dokumen saat ini:{" "}
                  <a href={profil.dokumenUrl} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark font-medium transition-colors">
                    Lihat dokumen lama
                  </a>
                </p>
              )}
            </div>

            {/* Tombol simpan */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  : <Save className="w-4 h-4" aria-hidden="true" />}
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              {isDirty && (
                <button
                  type="button"
                  onClick={() => {
                    setNamaPerusahaan(profil?.namaPerusahaan ?? "");
                    setBidang(profil?.bidang ?? "");
                    setDokumenUrl(profil?.dokumenUrl ?? "");
                    setError(""); setSuccess("");
                  }}
                  className="text-sm font-semibold text-ink-600 hover:text-ink transition-colors"
                >
                  Batalkan
                </button>
              )}
            </div>

          </form>
        </div>
      )}
    </CompanyLayout>
  );
}
