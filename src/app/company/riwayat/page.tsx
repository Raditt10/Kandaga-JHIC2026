"use client";

/**
 * /company/riwayat — Riwayat permintaan minat perusahaan.
 *
 * Heading outline:
 *   h1: "Riwayat Permintaan"
 *     h2: judul karya di tiap item riwayat
 *
 * Status badge mapping sesuai alurMitra.md §5:
 *   terkirim    → info (biru)
 *   ditinjau    → pending (kuning)
 *   klarifikasi → pending (kuning, label berbeda — butuh aksi)
 *   diteruskan  → success (hijau)
 *   ditolak     → error (merah)
 */

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CompanyLayout from "@/components/company/CompanyLayout";
import {
  ClipboardList, Loader2, AlertCircle,
  Clock, Eye, MessageSquare, CheckCircle2, XCircle,
} from "lucide-react";

// ── Status mapping (alurMitra §5) ─────────────────────────────────────────

type StatusKey = "terkirim" | "ditinjau" | "klarifikasi" | "diteruskan" | "ditolak";

const STATUS_MAP: Record<StatusKey, { label: string; color: string; icon: React.ElementType }> = {
  terkirim:    { label: "Terkirim, menunggu ditinjau",  color: "bg-blue-100 text-blue-700 border-blue-200",    icon: Clock },
  ditinjau:    { label: "Sedang ditinjau BKK",          color: "bg-amber-100 text-amber-700 border-amber-200", icon: Eye },
  klarifikasi: { label: "Perlu klarifikasi dari Anda",  color: "bg-amber-100 text-amber-800 border-amber-200", icon: MessageSquare },
  diteruskan:  { label: "Diteruskan ke siswa",          color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  ditolak:     { label: "Tidak dapat diproses",         color: "bg-rose-100 text-rose-700 border-rose-200",    icon: XCircle },
};

// ── Types ─────────────────────────────────────────────────────────────────

type RiwayatItem = {
  id:         string;
  status:     string;
  tujuan:     string;
  pesan:      string;
  catatanBkk: string | null;
  createdAt:  string;
  updatedAt:  string;
  karya: {
    id:           string;
    title:        string;
    thumbnailUrl: string | null;
    jurusanNama:  string;
    siswaNama:    string;
    year:         number;
  };
};

const TUJUAN_LABEL: Record<string, string> = {
  magang:      "Magang / PKL",
  kerja:       "Rekrutmen Kerja",
  kolaborasi:  "Kolaborasi Proyek",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── Komponen item riwayat ─────────────────────────────────────────────────

function RiwayatCard({ item }: { item: RiwayatItem }) {
  const statusKey = item.status as StatusKey;
  const statusInfo = STATUS_MAP[statusKey] ?? {
    label: item.status,
    color: "bg-ink-100 text-ink-600 border-ink-150",
    icon:  Clock,
  };
  const StatusIcon = statusInfo.icon;
  const needsAction = statusKey === "klarifikasi";

  return (
    <article className={`rounded-2xl border bg-white overflow-hidden transition-shadow hover:shadow-sm ${
      needsAction ? "border-amber-300" : "border-ink-150"
    }`}>
      <div className="flex gap-4 p-4 sm:p-5">

        {/* Thumbnail karya */}
        <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-ink-100">
          {item.karya.thumbnailUrl ? (
            <Image
              src={item.karya.thumbnailUrl}
              alt={item.karya.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-ink-300" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Konten */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* h2 — di bawah h1 halaman */}
            <h2 className="font-heading text-sm font-bold text-ink leading-snug line-clamp-2">
              {item.karya.title}
            </h2>
            {/* Badge status */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${statusInfo.color}`}>
              <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {statusInfo.label}
            </span>
          </div>

          {/* Meta */}
          <p className="text-xs text-ink-600">
            {item.karya.jurusanNama} · {item.karya.siswaNama} · {item.karya.year}
          </p>

          {/* Detail permintaan */}
          <div className="flex flex-wrap gap-3 text-xs text-ink-600">
            <span className="font-medium text-ink">{TUJUAN_LABEL[item.tujuan] ?? item.tujuan}</span>
            <span>·</span>
            <span>Dikirim {formatDate(item.createdAt)}</span>
            {item.updatedAt !== item.createdAt && (
              <>
                <span>·</span>
                <span>Diperbarui {formatDate(item.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Catatan BKK — tampil untuk klarifikasi dan ditolak */}
      {item.catatanBkk && (
        <div className={`mx-4 mb-4 rounded-xl px-4 py-3 text-sm ${
          needsAction
            ? "border border-amber-200 bg-amber-50 text-amber-800"
            : "border border-ink-150 bg-ink-100 text-ink-700"
        }`}>
          <p className="font-semibold text-xs mb-1">
            {needsAction ? "Catatan BKK — tindakan diperlukan:" : "Catatan BKK:"}
          </p>
          <p className="leading-relaxed">{item.catatanBkk}</p>
        </div>
      )}

      {/* Pesan yang dikirim — collapsible singkat */}
      <details className="mx-4 mb-4">
        <summary className="text-xs font-semibold text-ink-600 cursor-pointer hover:text-ink transition-colors">
          Lihat pesan yang dikirim
        </summary>
        <p className="mt-2 text-sm text-ink-700 leading-relaxed bg-ink-100 rounded-xl px-4 py-3">
          {item.pesan}
        </p>
      </details>
    </article>
  );
}

// ── Halaman ───────────────────────────────────────────────────────────────

export default function RiwayatPage() {
  const [items, setItems]     = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchRiwayat = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/company/minat");
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal memuat riwayat."); return; }
      setItems(data.items);
    } catch {
      setError("Kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRiwayat(); }, [fetchRiwayat]);

  // Hitung ringkasan status
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <CompanyLayout pageTitle="Riwayat Permintaan">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
            Riwayat Permintaan
          </h1>
          <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
            {items.length > 0
              ? `${items.length} permintaan tercatat.`
              : "Semua ajuan minat rekrutmen dan magang Anda."}
          </p>
        </div>
        <Link
          href="/company/katalog"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Ajukan Minat Baru
        </Link>
      </div>

      {/* Ringkasan status */}
      {items.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(STATUS_MAP) as StatusKey[])
            .filter((k) => counts[k])
            .map((k) => {
              const { label, color, icon: Icon } = STATUS_MAP[k];
              return (
                <span key={k} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                  <span className="ml-0.5 font-bold">({counts[k]})</span>
                </span>
              );
            })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-ink-300 animate-spin" aria-hidden="true" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink-200 bg-[#FBF9F6]/80 py-16 px-6 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white border border-ink-200/80 shadow-xs flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-[#8B1A2F]" aria-hidden="true" />
          </div>
          <h3 className="font-heading text-lg font-bold text-ink">
            Belum Ada Permintaan
          </h3>
          <p className="text-sm text-ink-700 mt-2 max-w-xs leading-relaxed">
            Jelajahi katalog karya siswa dan ajukan minat rekrutmen atau magang pertama Anda.
          </p>
          <Link
            href="/company/katalog"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-xs"
          >
            Jelajahi Katalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <RiwayatCard key={item.id} item={item} />
          ))}
        </div>
      )}

    </CompanyLayout>
  );
}
