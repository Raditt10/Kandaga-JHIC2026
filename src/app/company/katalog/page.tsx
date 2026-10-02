"use client";

/**
 * /company/katalog — Jelajahi katalog karya siswa.
 *
 * Heading outline (design-rules §3):
 *   h1: "Jelajahi Katalog Karya"
 *     h2: judul tiap kartu karya (h2 karena di bawah h1 halaman)
 *
 * Design-rules yang diterapkan:
 * - font-heading pada h1 dan h2 kartu (§1)
 * - text-sm minimum pada label/badge (§2)
 * - max-w-[65ch] pada deskripsi (§4)
 * - Satu pola kartu — tidak ada nested card ganda (§6)
 * - Kontras ink-700 untuk body text (§7)
 */

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import CompanyLayout from "@/components/company/CompanyLayout";
import {
  Search, Bookmark, BookmarkCheck, ArrowRight,
  Eye, Loader2, AlertCircle, FlaskConical, Network, Code2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

type Badge = { tier: string; nama: string };

type KatalogItem = {
  id:           string;
  title:        string;
  description:  string;
  year:         number;
  viewCount:    number;
  thumbnailUrl: string | null;
  jurusanKode:  string;
  jurusanNama:  string;
  siswaNama:    string;
  badges:       Badge[];
  isBookmarked: boolean;
};

// ── Filter jurusan ────────────────────────────────────────────────────────

const FILTERS = [
  { value: "",             label: "Semua",        icon: null },
  { value: "rpl",         label: "RPL",           icon: Code2 },
  { value: "tkj",         label: "TKJ",           icon: Network },
  { value: "analis-kimia", label: "Analis Kimia", icon: FlaskConical },
];

// Warna badge tier (alurMitra §5 mapping ke tampilan)
const BADGE_TIER_COLOR: Record<string, string> = {
  terpilih: "bg-blue-100 text-blue-700 border-blue-200",
  unggulan: "bg-violet-100 text-violet-700 border-violet-200",
  juara:    "bg-amber-100 text-amber-700 border-amber-200",
  industri: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// ── Modal ajukan minat (kosong — diisi Fase 5) ────────────────────────────

function AjukanMinatModal({
  project,
  onClose,
}: {
  project: KatalogItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-ink-150 shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-ink-600 mb-1">Ajukan Minat via BKK</p>
            <h2 className="font-heading text-lg font-bold text-ink leading-snug max-w-[40ch]">
              {project.title}
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              {project.siswaNama} · {project.jurusanNama} · {project.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-ink transition-colors p-1"
            aria-label="Tutup modal"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Placeholder — form diisi di Fase 5 */}
        <div className="rounded-2xl border-2 border-dashed border-ink-150 p-6 text-center">
          <Loader2 className="w-6 h-6 text-ink-300 mx-auto mb-2 animate-spin" aria-hidden="true" />
          <p className="text-sm font-semibold text-ink-600">
            Form ajukan minat
          </p>
          <p className="text-xs text-ink-300 mt-1">
            Pilihan tujuan (magang/kerja/kolaborasi) dan pesan akan
            tersedia di Fase 5.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-ink-150 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
          >
            Batal
          </button>
          <button
            disabled
            className="flex-1 rounded-full bg-primary/50 py-2.5 text-sm font-bold text-white cursor-not-allowed"
          >
            Kirim Minat
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Kartu karya ───────────────────────────────────────────────────────────

function ProjectCard({
  item,
  onBookmarkToggle,
  onAjukanMinat,
}: {
  item:             KatalogItem;
  onBookmarkToggle: (id: string, current: boolean) => void;
  onAjukanMinat:    (item: KatalogItem) => void;
}) {
  const [bookmarking, setBookmarking] = useState(false);
  const isBookmarked = item.isBookmarked;

  const handleBookmark = async () => {
    if (bookmarking) return;
    setBookmarking(true);
    await onBookmarkToggle(item.id, isBookmarked);
    setBookmarking(false);
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-ink-150 bg-white overflow-hidden hover:shadow-md transition-shadow">

      {/* Thumbnail */}
      <div className="relative h-44 bg-ink-100">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-ink-300 text-xs font-mono">Tidak ada gambar</span>
          </div>
        )}
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors" />

        {/* Badge tier */}
        {item.badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex gap-1 flex-wrap">
            {item.badges.map((b) => (
              <span
                key={b.tier}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  BADGE_TIER_COLOR[b.tier] ?? "bg-ink-100 text-ink-600 border-ink-150"
                }`}
              >
                {b.nama}
              </span>
            ))}
          </div>
        )}

        {/* Bookmark button */}
        <button
          type="button"
          onClick={handleBookmark}
          disabled={bookmarking}
          aria-label={isBookmarked ? "Hapus bookmark" : "Bookmark karya ini"}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full border transition-colors ${
            isBookmarked
              ? "bg-primary text-white border-primary"
              : "bg-white/90 text-ink-600 border-ink-150 hover:bg-primary hover:text-white hover:border-primary"
          }`}
        >
          {isBookmarked
            ? <BookmarkCheck className="w-4 h-4" />
            : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Konten kartu */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Jurusan chip */}
        <span className="inline-flex items-center gap-1 self-start px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-semibold border border-primary/20">
          {item.jurusanNama}
        </span>

        {/* h2 — di bawah h1 halaman (design-rules §3) */}
        <h2 className="font-heading text-sm font-bold text-ink leading-snug line-clamp-2">
          {item.title}
        </h2>

        <p className="text-xs text-ink-700 leading-relaxed line-clamp-2 max-w-[65ch]">
          {item.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-ink-600 mt-auto pt-2 border-t border-ink-150">
          <span className="font-medium truncate">{item.siswaNama}</span>
          <span>·</span>
          <span>{item.year}</span>
          <span className="ml-auto flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            {item.viewCount}
          </span>
        </div>

        {/* Tombol ajukan minat */}
        <button
          type="button"
          onClick={() => onAjukanMinat(item)}
          className="w-full flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition-colors"
        >
          Ajukan Minat via BKK
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

// ── Halaman utama ─────────────────────────────────────────────────────────

export default function KatalogPage() {
  const [items, setItems]           = useState<KatalogItem[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [query, setQuery]           = useState("");
  const [jurusan, setJurusan]       = useState("");
  const [modalItem, setModalItem]   = useState<KatalogItem | null>(null);
  const [isPending, startTransition]= useTransition();

  // ── Fetch katalog ──────────────────────────────────────────────────
  const fetchKatalog = useCallback(async (
    q: string, j: string, p: number
  ) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        ...(q ? { q } : {}),
        ...(j ? { jurusan: j } : {}),
        page: String(p),
      });
      const res  = await fetch(`/api/company/katalog?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal memuat katalog."); return; }
      setItems(data.items);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setError("Kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKatalog(query, jurusan, page); }, []);

  // ── Handle filter change ───────────────────────────────────────────
  const handleJurusanChange = (val: string) => {
    startTransition(() => {
      setJurusan(val);
      setPage(1);
      fetchKatalog(query, val, 1);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      setPage(1);
      fetchKatalog(query, jurusan, 1);
    });
  };

  // ── Handle bookmark toggle ─────────────────────────────────────────
  const handleBookmarkToggle = async (projectId: string, current: boolean) => {
    const method = current ? "DELETE" : "POST";
    try {
      const res = await fetch("/api/company/bookmark", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) return;
      // Update lokal tanpa refetch
      setItems((prev) =>
        prev.map((item) =>
          item.id === projectId ? { ...item, isBookmarked: !current } : item
        )
      );
    } catch { /* silent */ }
  };

  return (
    <CompanyLayout pageTitle="Jelajahi Katalog">

      {/* h1 */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
          Jelajahi Katalog Karya
        </h1>
        <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
          {total > 0 ? `${total} karya terverifikasi` : "Karya terverifikasi"} dari siswa SMKN 13 Bandung.
        </p>
      </div>

      {/* Search + filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul karya..."
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

        {/* Filter jurusan */}
        <div className={`flex gap-2 flex-wrap transition-opacity duration-150 ${isPending ? "opacity-60" : ""}`}>
          {FILTERS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleJurusanChange(value)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                jurusan === value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-ink-700 border-ink-150 hover:border-primary hover:text-primary"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
              {label}
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

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-ink-300 animate-spin" aria-hidden="true" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Search className="w-10 h-10 text-ink-300 mb-3" aria-hidden="true" />
          <p className="font-heading text-base font-semibold text-ink-600">
            Tidak ada karya yang cocok.
          </p>
          <p className="text-sm text-ink-300 mt-1">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <ProjectCard
              key={item.id}
              item={item}
              onBookmarkToggle={handleBookmarkToggle}
              onAjukanMinat={setModalItem}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => { setPage(p => p - 1); fetchKatalog(query, jurusan, page - 1); }}
            className="px-4 py-2 rounded-full border border-ink-150 text-sm font-semibold text-ink-700 disabled:opacity-40 hover:bg-ink-100 transition-colors"
          >
            ← Sebelumnya
          </button>
          <span className="text-sm text-ink-600">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => { setPage(p => p + 1); fetchKatalog(query, jurusan, page + 1); }}
            className="px-4 py-2 rounded-full border border-ink-150 text-sm font-semibold text-ink-700 disabled:opacity-40 hover:bg-ink-100 transition-colors"
          >
            Berikutnya →
          </button>
        </div>
      )}

      {/* Modal ajukan minat */}
      {modalItem && (
        <AjukanMinatModal
          project={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}

    </CompanyLayout>
  );
}
