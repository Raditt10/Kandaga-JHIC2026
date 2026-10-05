"use client";

/**
 * /company/tersimpan — Daftar karya yang di-bookmark perusahaan ini.
 *
 * Heading outline:
 *   h1: "Talenta Tersimpan"
 *     h2: judul kartu karya
 */

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CompanyLayout from "@/components/company/CompanyLayout";
import AjukanMinatModal, { type MinatProject } from "@/components/company/AjukanMinatModal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Bookmark, BookmarkX, Eye, ArrowRight,
  Loader2, AlertCircle,
} from "lucide-react";

type SavedItem = {
  id:           string;
  title:        string;
  description:  string;
  year:         number;
  viewCount:    number;
  thumbnailUrl: string | null;
  jurusanNama:  string;
  siswaNama:    string;
};

export default function TersimpanPage() {
  const [items, setItems]     = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [modalItem, setModalItem] = useState<MinatProject | null>(null);

  const fetchTersimpan = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Pakai endpoint katalog dengan filter bookmark=true
      // Fase ini: ambil semua karya dari katalog lalu filter isBookmarked
      // (API yang lebih spesifik bisa dipisah di iterasi berikutnya)
      const res  = await fetch("/api/company/katalog?page=1");
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal memuat data."); return; }
      setItems(
        (data.items as (SavedItem & { isBookmarked: boolean })[])
          .filter((i) => i.isBookmarked)
      );
    } catch {
      setError("Kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTersimpan(); }, [fetchTersimpan]);

  const handleRemoveBookmark = async (projectId: string) => {
    try {
      const res = await fetch("/api/company/bookmark", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ projectId }),
      });
      if (!res.ok) return;
      setItems((prev) => prev.filter((i) => i.id !== projectId));
    } catch { /* silent */ }
  };

  return (
    <CompanyLayout pageTitle="Talenta Tersimpan">

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
            Talenta Tersimpan
          </h1>
          <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
            Karya siswa yang Anda tandai untuk ditinjau kembali.
            {items.length > 0 && ` ${items.length} karya tersimpan.`}
          </p>
        </div>
        <Link
          href="/company/katalog"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Bookmark className="w-4 h-4" aria-hidden="true" />
          Cari Lebih Banyak
        </Link>
      </div>

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
        /* Empty state */
        <div className="bg-white rounded-3xl border border-ink-150 p-6 shadow-xs max-w-lg mx-auto">
          <EmptyState
            title="Belum Ada Karya yang Disimpan"
            description="Kunjungi katalog karya siswa dan simpan proyek favorit Anda untuk ditinjau nanti."
            action={{
              label: "Jelajahi Katalog",
              href: "/company/katalog",
            }}
          />
        </div>
      ) : (
        /* Grid karya tersimpan */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl border border-ink-150 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-ink-100">
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
                {/* Tombol hapus bookmark */}
                <button
                  type="button"
                  onClick={() => handleRemoveBookmark(item.id)}
                  aria-label="Hapus dari tersimpan"
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 border border-ink-150 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                >
                  <BookmarkX className="w-4 h-4" />
                </button>
              </div>

              {/* Konten */}
              <div className="flex flex-col flex-1 p-4 gap-2.5">
                <span className="self-start px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-semibold border border-primary/20">
                  {item.jurusanNama}
                </span>
                <h2 className="font-heading text-sm font-bold text-ink leading-snug line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-xs text-ink-700 leading-relaxed line-clamp-2 max-w-[65ch]">
                  {item.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-ink-600 mt-auto pt-2 border-t border-ink-150">
                  <span className="truncate">{item.siswaNama}</span>
                  <span>·</span>
                  <span>{item.year}</span>
                  <span className="ml-auto flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    {item.viewCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalItem({
                    id: item.id, title: item.title,
                    siswaNama: item.siswaNama, jurusanNama: item.jurusanNama, year: item.year,
                  })}
                  className="w-full flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition-colors"
                >
                  Ajukan Minat via BKK
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal ajukan minat */}
      {modalItem && (
        <AjukanMinatModal
          project={modalItem}
          onClose={() => setModalItem(null)}
          onSuccess={() => setModalItem(null)}
        />
      )}

    </CompanyLayout>
  );
}
