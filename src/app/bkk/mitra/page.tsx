"use client";

/**
 * /bkk/mitra — Manajemen Mitra: riwayat semua keputusan verifikasi.
 * Beda dari /bkk/verifikasi (antrian aktif): ini untuk rujukan historis.
 *
 * Heading outline (design-rules §3):
 *   h1: "Manajemen Mitra"
 *     h2: (tidak ada — konten berupa tabel/list)
 *
 * Design-rules:
 * - text-sm minimum pada semua label tabel (§2)
 * - Badge status: token warna semantic pending/success/error (§7)
 * - max-w-[65ch] pada deskripsi (§4)
 */

import { useCallback, useEffect, useState, useTransition } from "react";
import BKKLayout from "@/components/bkk/BKKLayout";
import {
  Building2, Search, Loader2, AlertCircle,
  Clock, CheckCircle2, XCircle, ExternalLink, Filter,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

type MitraItem = {
  userId:            string;
  namaKontak:        string;
  email:             string;
  namaPerusahaan:    string;
  bidang:            string | null;
  dokumenUrl:        string | null;
  status:            "pending" | "disetujui" | "ditolak";
  catatanVerifikasi: string | null;
  verifiedBy:        string | null;
  verifiedAt:        string | null;
  terdaftarPada:     string;
};

type Summary = {
  semua:     number;
  pending:   number;
  disetujui: number;
  ditolak:   number;
};

// ── Status badge mapping (design-rules §7 + alurKonfirmasiBKK §4) ─────────

const STATUS_MAP = {
  pending: {
    label: "Menunggu",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon:  Clock,
  },
  disetujui: {
    label: "Disetujui",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon:  CheckCircle2,
  },
  ditolak: {
    label: "Ditolak",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon:  XCircle,
  },
} as const;

const FILTER_OPTIONS = [
  { value: "",          label: "Semua",     key: "semua"     },
  { value: "pending",   label: "Menunggu",  key: "pending"   },
  { value: "disetujui", label: "Disetujui", key: "disetujui" },
  { value: "ditolak",   label: "Ditolak",   key: "ditolak"   },
] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Komponen baris detail (expandable) ────────────────────────────────────

function MitraRow({ item }: { item: MitraItem }) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = STATUS_MAP[item.status];
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <tr
        className="hover:bg-ink-100/50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Perusahaan */}
        <td className="px-5 py-4">
          <p className="font-semibold text-sm text-ink">{item.namaPerusahaan}</p>
          <p className="text-xs text-ink-600 font-mono mt-0.5 truncate max-w-[200px]">
            {item.email}
          </p>
        </td>

        {/* Kontak */}
        <td className="px-5 py-4 hidden sm:table-cell">
          <p className="text-sm text-ink-700">{item.namaKontak}</p>
          {item.bidang && (
            <p className="text-xs text-ink-600 mt-0.5">{item.bidang}</p>
          )}
        </td>

        {/* Status */}
        <td className="px-5 py-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusInfo.color}`}>
            <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {statusInfo.label}
          </span>
        </td>

        {/* Tanggal */}
        <td className="px-5 py-4 hidden md:table-cell text-sm text-ink-600">
          {formatDate(item.terdaftarPada)}
        </td>

        {/* Expand chevron */}
        <td className="px-5 py-4 text-right">
          <span className={`text-ink-300 transition-transform inline-block ${expanded ? "rotate-180" : ""}`} aria-hidden="true">
            ▾
          </span>
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr className="bg-ink-100/30">
          <td colSpan={5} className="px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

              {/* Dokumen */}
              <div>
                <p className="text-xs font-mono text-ink-600 mb-1">Dokumen legalitas</p>
                {item.dokumenUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={item.dokumenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      Lihat dokumen
                    </a>
                    <span className="text-xs text-ink-300">(mode demo)</span>
                  </div>
                ) : (
                  <p className="text-ink-300">Tidak ada dokumen.</p>
                )}
              </div>

              {/* Diverifikasi oleh */}
              {item.verifiedBy && (
                <div>
                  <p className="text-xs font-mono text-ink-600 mb-1">
                    {item.status === "disetujui" ? "Disetujui oleh" : "Ditolak oleh"}
                  </p>
                  <p className="font-medium text-ink">
                    {item.verifiedBy}
                    {item.verifiedAt && (
                      <span className="text-ink-600 font-normal ml-1">
                        pada {formatDate(item.verifiedAt)}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Catatan verifikasi — tampil untuk ditolak */}
              {item.status === "ditolak" && item.catatanVerifikasi && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-mono text-ink-600 mb-1">Catatan penolakan</p>
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-sm text-rose-800 leading-relaxed max-w-[65ch]">
                      {item.catatanVerifikasi}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Halaman ───────────────────────────────────────────────────────────────

export default function BKKMitraPage() {
  const [items, setItems]     = useState<MitraItem[]>([]);
  const [summary, setSummary] = useState<Summary>({ semua: 0, pending: 0, disetujui: 0, ditolak: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [query, setQuery]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isPending, startTransition]    = useTransition();

  const fetchMitra = useCallback(async (q: string, s: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        ...(q ? { q } : {}),
        ...(s ? { status: s } : {}),
      });
      const res  = await fetch(`/api/bkk/mitra?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal memuat."); return; }
      setItems(data.items);
      setSummary(data.summary);
    } catch {
      setError("Kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMitra("", ""); }, [fetchMitra]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => fetchMitra(query, statusFilter));
  };

  const handleFilterChange = (val: string) => {
    startTransition(() => {
      setStatusFilter(val);
      fetchMitra(query, val);
    });
  };

  return (
    <BKKLayout pageTitle="Manajemen Mitra">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
          Manajemen Mitra
        </h1>
        <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
          Riwayat semua perusahaan yang pernah mendaftar sebagai mitra Kandaga.
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari perusahaan atau email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ink-150 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Cari
          </button>
        </form>

        {/* Filter status dengan count badge */}
        <div className={`flex gap-2 flex-wrap transition-opacity ${isPending ? "opacity-60" : ""}`}>
          {FILTER_OPTIONS.map(({ value, label, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleFilterChange(value)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border transition-colors ${
                statusFilter === value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-ink-700 border-ink-150 hover:border-primary hover:text-primary"
              }`}
            >
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
              <span className={`font-bold text-xs ${statusFilter === value ? "text-white/80" : "text-ink-300"}`}>
                ({summary[key as keyof Summary]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Tabel */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-ink-300 animate-spin" aria-hidden="true" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-violet-400" aria-hidden="true" />
          </div>
          <p className="font-heading text-base font-semibold text-ink-600">
            Tidak ada mitra yang cocok.
          </p>
          <p className="text-sm text-ink-300 mt-1">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-150">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-100 border-b border-ink-150">
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Perusahaan</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden sm:table-cell">Narahubung</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden md:table-cell">Terdaftar</th>
                <th className="px-5 py-3.5 w-10" aria-label="Detail"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-150 bg-white">
              {items.map((item) => (
                <MitraRow key={item.userId} item={item} />
              ))}
            </tbody>
          </table>

          {/* Footer tabel */}
          <div className="px-5 py-3 border-t border-ink-150 bg-ink-100/50 flex items-center justify-between">
            <p className="text-xs text-ink-600">
              Menampilkan <strong>{items.length}</strong> dari <strong>{summary.semua}</strong> mitra
            </p>
            <div className="flex gap-3 text-xs text-ink-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                {summary.pending} menunggu
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                {summary.disetujui} disetujui
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
                {summary.ditolak} ditolak
              </span>
            </div>
          </div>
        </div>
      )}

    </BKKLayout>
  );
}
