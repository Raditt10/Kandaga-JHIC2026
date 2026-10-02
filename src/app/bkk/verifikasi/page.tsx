"use client";

/**
 * /bkk/verifikasi — Antrian verifikasi akun perusahaan (FIFO).
 *
 * Heading outline (design-rules §3):
 *   h1: "Antrian Verifikasi Akun"
 *     h2: nama perusahaan tiap baris (di modal detail — Fase 3)
 *
 * Fase 2: tabel list antrian, klik baris buka modal detail + aksi.
 * Design-rules yang diterapkan:
 * - text-sm minimum untuk semua label tabel (§2)
 * - max-w-[65ch] pada teks deskriptif (§4)
 * - Kontras ink-700 (§7)
 */

import { useCallback, useEffect, useState } from "react";
import BKKLayout from "@/components/bkk/BKKLayout";
import {
  ShieldCheck, Clock, Loader2, AlertCircle,
  CheckCircle2, XCircle, Eye, ExternalLink,
} from "lucide-react";

type AntrianItem = {
  userId:         string;
  namaKontak:     string;
  email:          string;
  namaPerusahaan: string;
  bidang:         string | null;
  dokumenUrl:     string | null;
  terdaftarPada:  string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Hari ini";
  if (days === 1) return "1 hari lalu";
  return `${days} hari lalu`;
}

// ── Modal detail + aksi ────────────────────────────────────────────────────

function DetailModal({
  item,
  onClose,
  onAction,
}: {
  item:     AntrianItem;
  onClose:  () => void;
  onAction: (userId: string, action: "setujui" | "tolak", catatan?: string) => Promise<void>;
}) {
  const [catatan, setCatatan] = useState("");
  const [showTolak, setShowTolak] = useState(false);
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState("");

  const handleAction = async (action: "setujui" | "tolak") => {
    if (action === "tolak" && catatan.trim().length < 10) {
      setError("Catatan penolakan minimal 10 karakter.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onAction(item.userId, action, catatan);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memproses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border border-ink-150 shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-ink-150">
          <p className="text-xs font-mono text-ink-600 mb-0.5">Detail Pengajuan Akun Mitra</p>
          <h2 className="font-heading text-xl font-bold text-ink">{item.namaPerusahaan}</h2>
        </div>

        {/* Detail */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Nama kontak</p>
              <p className="text-sm font-semibold text-ink">{item.namaKontak}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Email</p>
              <p className="text-sm font-semibold text-ink font-mono truncate">{item.email}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Bidang usaha</p>
              <p className="text-sm text-ink">{item.bidang ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Tanggal daftar</p>
              <p className="text-sm text-ink">{formatDate(item.terdaftarPada)}</p>
            </div>
          </div>

          {/* Dokumen — sesuai §3: tampilkan apa adanya (mock) */}
          <div>
            <p className="text-xs font-mono text-ink-600 mb-1">Dokumen legalitas</p>
            {item.dokumenUrl ? (
              <div className="flex items-center gap-2">
                <a
                  href={item.dokumenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  Lihat dokumen
                </a>
                <span className="text-xs text-ink-300">(mode demo — pratinjau mungkin tidak tersedia)</span>
              </div>
            ) : (
              <p className="text-sm text-ink-300">Tidak ada dokumen diunggah.</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Form tolak */}
          {showTolak && (
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Catatan penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                placeholder="Jelaskan alasan penolakan (min. 10 karakter)..."
                className="w-full rounded-xl border border-ink-150 px-4 py-3 text-sm text-ink bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
              />
              <p className={`mt-1 text-xs ${catatan.trim().length >= 10 ? "text-emerald-600" : "text-ink-300"}`}>
                {catatan.trim().length}/10 karakter minimum
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-ink-150 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
          >
            Tutup
          </button>

          {!showTolak ? (
            <>
              <button
                type="button"
                onClick={() => setShowTolak(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
                Tolak
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction("setujui")}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Setujui
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setShowTolak(false); setCatatan(""); setError(""); }}
                className="flex-1 rounded-full border border-ink-150 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading || catatan.trim().length < 10}
                onClick={() => handleAction("tolak")}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Konfirmasi Tolak
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Halaman ───────────────────────────────────────────────────────────────

export default function VerifikasiPage() {
  const [items, setItems]       = useState<AntrianItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState<AntrianItem | null>(null);

  const fetchAntrian = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/bkk/verifikasi");
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal memuat."); return; }
      setItems(data.items);
    } catch { setError("Kesalahan koneksi."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAntrian(); }, [fetchAntrian]);

  const handleAction = async (userId: string, action: "setujui" | "tolak", catatan?: string) => {
    const res  = await fetch("/api/bkk/verifikasi", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId, action, catatan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Gagal memproses.");
    // Hapus baris dari list setelah aksi
    setItems((prev) => prev.filter((i) => i.userId !== userId));
  };

  return (
    <BKKLayout pageTitle="Verifikasi Akun">

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
            Antrian Verifikasi Akun
          </h1>
          <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
            Pengajuan akun mitra diurutkan FIFO — paling lama menunggu ditampilkan paling atas.
            {items.length > 0 && ` ${items.length} pengajuan menunggu.`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-ink-300 animate-spin" aria-hidden="true" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-500" aria-hidden="true" />
          </div>
          <p className="font-heading text-base font-semibold text-ink-600">
            Tidak ada pengajuan yang menunggu.
          </p>
          <p className="text-sm text-ink-300 mt-1">Semua pengajuan sudah diproses.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-150">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-100 border-b border-ink-150">
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Perusahaan</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden sm:table-cell">Bidang</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden md:table-cell">Menunggu</th>
                <th className="px-5 py-3.5" aria-label="Aksi"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-150 bg-white">
              {items.map((item) => (
                <tr key={item.userId} className="hover:bg-ink-100/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{item.namaPerusahaan}</p>
                    <p className="text-xs text-ink-600 font-mono mt-0.5">{item.email}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-700 hidden sm:table-cell">
                    {item.bidang ?? <span className="text-ink-300">—</span>}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {daysAgo(item.terdaftarPada)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-ink-150 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      Tinjau
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detail */}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </BKKLayout>
  );
}
