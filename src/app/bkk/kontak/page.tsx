"use client";

/**
 * /bkk/kontak — Antrian permintaan kontak (minat perusahaan ke karya siswa).
 *
 * Sisi BKK dari alurMitra.md §2. Perusahaan tidak pernah menghubungi siswa
 * langsung; BKK meninjau tiap permintaan lalu memutuskan.
 *
 * Heading outline (design-rules §3):
 *   h1: "Antrian Permintaan Kontak"
 *     h2: judul modal detail (nama perusahaan / judul karya)
 *
 * Design-rules yang diterapkan:
 * - text-sm minimum untuk semua label tabel (§2)
 * - max-w-[65ch] pada teks deskriptif (§4)
 * - Kontras ink-700 (§7)
 */

import { useCallback, useEffect, useState } from "react";
import BKKLayout from "@/components/bkk/BKKLayout";
import {
  MessageSquare, Clock, Loader2, AlertCircle, Eye,
  CheckCircle2, XCircle, Send, HelpCircle, Building2,
} from "lucide-react";

// ── Tipe ───────────────────────────────────────────────────────────────────

type StatusKey = "terkirim" | "ditinjau" | "klarifikasi" | "diteruskan" | "ditolak";
type ActionKey = "tinjau" | "klarifikasi" | "teruskan" | "tolak";

type AntrianItem = {
  id:         string;
  status:     StatusKey;
  tujuan:     string;
  pesan:      string;
  catatanBkk: string | null;
  createdAt:  string;
  updatedAt:  string;
  reviewedAt: string | null;
  perusahaan: {
    nama:   string;
    bidang: string | null;
    kontak: string;
    email:  string;
  };
  karya: {
    id:           string;
    title:        string;
    thumbnailUrl: string | null;
    jurusanNama:  string;
    siswaNama:    string;
    year:         number;
  };
};

// ── Pemetaan status & tujuan (samakan dengan company/riwayat) ──────────────

const STATUS_MAP: Record<StatusKey, { label: string; color: string }> = {
  terkirim:    { label: "Terkirim, menunggu ditinjau", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ditinjau:    { label: "Sedang ditinjau BKK",         color: "bg-amber-100 text-amber-700 border-amber-200" },
  klarifikasi: { label: "Menunggu klarifikasi",        color: "bg-amber-100 text-amber-800 border-amber-200" },
  diteruskan:  { label: "Diteruskan ke siswa",         color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ditolak:     { label: "Tidak dapat diproses",        color: "bg-rose-100 text-rose-700 border-rose-200" },
};

const TUJUAN_LABEL: Record<string, string> = {
  magang:     "Magang / PKL",
  kerja:      "Rekrutmen Kerja",
  kolaborasi: "Kolaborasi Proyek",
};

/** Permintaan final tidak bisa diproses ulang. */
const isFinal = (s: StatusKey) => s === "diteruskan" || s === "ditolak";

const MIN_CATATAN = 10;

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
  onAction: (id: string, action: ActionKey, catatan?: string) => Promise<void>;
}) {
  const [noteMode, setNoteMode] = useState<null | "klarifikasi" | "tolak">(null);
  const [catatan, setCatatan]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const statusInfo = STATUS_MAP[item.status];
  const final      = isFinal(item.status);

  const run = async (action: ActionKey, note?: string) => {
    setError("");
    setLoading(true);
    try {
      await onAction(item.id, action, note);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memproses.");
    } finally {
      setLoading(false);
    }
  };

  const submitNote = () => {
    if (catatan.trim().length < MIN_CATATAN) {
      setError(`Catatan minimal ${MIN_CATATAN} karakter.`);
      return;
    }
    if (noteMode) run(noteMode, catatan);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-white rounded-3xl border border-ink-150 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-ink-150">
          <p className="text-xs font-mono text-ink-600 mb-0.5">Detail Permintaan Kontak</p>
          <h2 className="font-heading text-xl font-bold text-ink">{item.perusahaan.nama}</h2>
          <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Isi */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">

          {/* Karya yang diminta */}
          <div className="rounded-2xl border border-ink-150 bg-ink-100/30 p-4">
            <p className="text-xs font-mono text-ink-600 mb-1">Karya yang diminta</p>
            <p className="font-heading text-base font-bold text-ink">{item.karya.title}</p>
            <p className="text-sm text-ink-700 mt-0.5">
              {item.karya.siswaNama} · {item.karya.jurusanNama} · {item.karya.year}
            </p>
          </div>

          {/* Data perusahaan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Nama kontak</p>
              <p className="text-sm font-semibold text-ink">{item.perusahaan.kontak}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Email</p>
              <p className="text-sm font-semibold text-ink font-mono truncate">{item.perusahaan.email}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Bidang usaha</p>
              <p className="text-sm text-ink-700">{item.perusahaan.bidang ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Tujuan</p>
              <p className="text-sm text-ink-700">{TUJUAN_LABEL[item.tujuan] ?? item.tujuan}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Tanggal masuk</p>
              <p className="text-sm text-ink-700">{formatDate(item.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Sudah menunggu</p>
              <p className="text-sm text-ink-700">{daysAgo(item.createdAt)}</p>
            </div>
          </div>

          {/* Pesan perusahaan */}
          <div>
            <p className="text-xs font-mono text-ink-600 mb-1">Pesan dari perusahaan</p>
            <p className="text-sm text-ink-700 whitespace-pre-wrap max-w-[65ch] rounded-xl border border-ink-150 bg-ink-100/30 px-4 py-3">
              {item.pesan}
            </p>
          </div>

          {/* Catatan BKK sebelumnya */}
          {item.catatanBkk && (
            <div>
              <p className="text-xs font-mono text-ink-600 mb-1">Catatan BKK</p>
              <p className="text-sm text-ink-700 whitespace-pre-wrap max-w-[65ch] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                {item.catatanBkk}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Form catatan (klarifikasi / tolak) */}
          {noteMode && (
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                {noteMode === "tolak" ? "Catatan penolakan" : "Pertanyaan klarifikasi"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                placeholder={
                  noteMode === "tolak"
                    ? "Jelaskan alasan penolakan (min. 10 karakter)..."
                    : "Tulis hal yang perlu diklarifikasi perusahaan (min. 10 karakter)..."
                }
                className="w-full rounded-xl border border-ink-150 px-4 py-3 text-sm text-ink bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
              />
              <p className={`mt-1 text-xs ${catatan.trim().length >= MIN_CATATAN ? "text-emerald-600" : "text-ink-300"}`}>
                {catatan.trim().length}/{MIN_CATATAN} karakter minimum
              </p>
            </div>
          )}

          {/* Info kalau sudah final */}
          {final && !noteMode && (
            <p className="text-sm text-ink-600 max-w-[65ch]">
              Permintaan ini sudah diputuskan
              {item.reviewedAt ? ` pada ${formatDate(item.reviewedAt)}` : ""}. Status tidak bisa diubah lagi.
            </p>
          )}
        </div>

        {/* Aksi */}
        <div className="px-6 py-5 border-t border-ink-150 bg-white">
          {noteMode ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setNoteMode(null); setCatatan(""); setError(""); }}
                className="flex-1 rounded-full border border-ink-150 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading || catatan.trim().length < MIN_CATATAN}
                onClick={submitNote}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-3 text-sm font-bold text-white disabled:opacity-50 transition-colors ${
                  noteMode === "tolak" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {noteMode === "tolak" ? "Konfirmasi Tolak" : "Kirim Klarifikasi"}
              </button>
            </div>
          ) : final ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-ink-150 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
            >
              Tutup
            </button>
          ) : (
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-2.5">
                {item.status === "terkirim" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => run("tinjau")}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 rounded-full border border-ink-150 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 disabled:opacity-60 transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    Tandai Ditinjau
                  </button>
                )}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setNoteMode("klarifikasi")}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-60 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  Minta Klarifikasi
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setNoteMode("tolak")}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-60 transition-colors"
                >
                  <XCircle className="w-4 h-4" aria-hidden="true" />
                  Tolak
                </button>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => run("teruskan")}
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Teruskan ke Siswa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Halaman ───────────────────────────────────────────────────────────────

type Filter = "aktif" | "semua";

export default function BKKKontakPage() {
  const [items, setItems]       = useState<AntrianItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState<Filter>("aktif");
  const [selected, setSelected] = useState<AntrianItem | null>(null);

  const fetchAntrian = useCallback(async (f: Filter) => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/bkk/kontak?status=${f === "semua" ? "semua" : "aktif"}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal memuat antrian."); return; }
      setItems(data.items);
    } catch {
      setError("Kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAntrian(filter); }, [fetchAntrian, filter]);

  const handleAction = async (id: string, action: ActionKey, catatan?: string) => {
    const res  = await fetch("/api/bkk/kontak", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, action, catatan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Gagal memproses.");

    // Di antrian aktif, baris yang sudah final hilang dari daftar.
    // Di mode "semua", cukup perbarui barisnya di tempat.
    if (filter === "aktif" && isFinal(data.status as StatusKey)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: data.status as StatusKey, catatanBkk: catatan?.trim() || null, reviewedAt: new Date().toISOString() }
            : i
        )
      );
    }
  };

  return (
    <BKKLayout pageTitle="Antrian Kontak">

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
          Antrian Permintaan Kontak
        </h1>
        <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
          Permintaan minat dari perusahaan untuk menghubungi siswa. Perusahaan tidak pernah
          menghubungi siswa langsung — tinjau dulu, lalu teruskan atau tolak.
          {filter === "aktif" && items.length > 0 && ` ${items.length} permintaan menunggu tindakan.`}
        </p>
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {([
          { key: "aktif", label: "Antrian Aktif" },
          { key: "semua", label: "Semua Status" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              filter === key
                ? "bg-primary/8 text-primary border-primary/30"
                : "bg-white text-ink-700 border-ink-150 hover:bg-ink-100"
            }`}
          >
            {label}
          </button>
        ))}
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
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-blue-500" aria-hidden="true" />
          </div>
          <p className="font-heading text-base font-semibold text-ink-600">
            {filter === "aktif"
              ? "Tidak ada permintaan yang menunggu tindakan."
              : "Belum ada permintaan kontak dari perusahaan."}
          </p>
          <p className="text-sm text-ink-300 mt-1 max-w-sm">
            {filter === "aktif"
              ? "Semua permintaan sudah diputuskan. Lihat tab Semua Status untuk riwayatnya."
              : "Permintaan akan muncul di sini setelah perusahaan mengajukan minat pada sebuah karya."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-150">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-100 border-b border-ink-150">
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Perusahaan</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden sm:table-cell">Karya &amp; Siswa</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden lg:table-cell">Tujuan</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden md:table-cell">Menunggu</th>
                <th className="px-5 py-3.5" aria-label="Aksi"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-150 bg-white">
              {items.map((item) => {
                const s = STATUS_MAP[item.status];
                return (
                  <tr key={item.id} className="hover:bg-ink-100/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink">{item.perusahaan.nama}</p>
                      <p className="text-xs text-ink-600 font-mono mt-0.5">{item.perusahaan.email}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-ink-700">{item.karya.title}</p>
                      <p className="text-xs text-ink-600 mt-0.5">{item.karya.siswaNama}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-700 hidden lg:table-cell">
                      {TUJUAN_LABEL[item.tujuan] ?? item.tujuan}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-amber-700">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {daysAgo(item.createdAt)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-ink-150 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        {isFinal(item.status) ? "Lihat" : "Tinjau"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}

      {/* Catatan kecil: alur keputusan (design-rules: jangan janjikan yang belum ada) */}
      <div className="mt-6 flex items-start gap-2 rounded-2xl border border-ink-150 bg-white px-4 py-3 max-w-[65ch]">
        <Building2 className="w-4 h-4 text-ink-300 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-ink-600">
          Alur keputusan: <span className="font-semibold text-ink">ditinjau</span> → minta{" "}
          <span className="font-semibold text-ink">klarifikasi</span>,{" "}
          <span className="font-semibold text-ink">teruskan</span> ke siswa, atau{" "}
          <span className="font-semibold text-ink">tolak</span> dengan catatan.
        </p>
      </div>
    </BKKLayout>
  );
}
