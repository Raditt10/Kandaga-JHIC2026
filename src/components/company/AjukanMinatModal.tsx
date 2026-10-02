"use client";

/**
 * AjukanMinatModal — modal form ajukan minat rekrutmen/magang via BKK.
 * Dipakai di /company/katalog dan /company/tersimpan.
 *
 * Heading outline:
 *   h2: "Ajukan Minat via BKK" (modal, bukan h1 halaman)
 *
 * Aturan bisnis (AGENTS.md §5):
 * - Perusahaan tidak pernah kontak siswa langsung
 * - Semua permintaan masuk ke antrian BKK terlebih dahulu
 */

import { useState } from "react";
import { AlertCircle, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export type MinatProject = {
  id:          string;
  title:       string;
  siswaNama:   string;
  jurusanNama: string;
  year:        number;
};

type Tujuan = "magang" | "kerja" | "kolaborasi";

const TUJUAN_OPTIONS: { value: Tujuan; label: string; desc: string }[] = [
  {
    value: "magang",
    label: "Magang / PKL",
    desc:  "Program Praktik Kerja Lapangan 6–10 bulan",
  },
  {
    value: "kerja",
    label: "Rekrutmen Kerja",
    desc:  "Penawaran posisi kerja penuh waktu atau paruh waktu",
  },
  {
    value: "kolaborasi",
    label: "Kolaborasi Proyek",
    desc:  "Kerja sama riset, tugas akhir, atau proyek teknis",
  },
];

interface Props {
  project:  MinatProject;
  onClose:  () => void;
  onSuccess?: (requestId: string) => void;
}

export default function AjukanMinatModal({ project, onClose, onSuccess }: Props) {
  const [tujuan, setTujuan]   = useState<Tujuan | "">("");
  const [pesan, setPesan]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const MIN_PESAN = 20;
  const pesanOk   = pesan.trim().length >= MIN_PESAN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tujuan) { setError("Pilih tujuan pengajuan."); return; }
    if (!pesanOk) { setError(`Pesan minimal ${MIN_PESAN} karakter.`); return; }

    setError("");
    setLoading(true);

    try {
      const res  = await fetch("/api/company/minat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ projectId: project.id, tujuan, pesan }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim. Coba lagi.");
        return;
      }

      setSuccess(true);
      onSuccess?.(data.requestId);
    } catch {
      setError("Kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-ink-150 shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-ink-150">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-ink-600 mb-0.5">Ajukan via BKK SMKN 13 Bandung</p>
              {/* h2 — modal heading */}
              <h2 className="font-heading text-lg font-bold text-ink leading-snug">
                Ajukan Minat
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-ink-300 hover:text-ink transition-colors rounded-lg hover:bg-ink-100"
              aria-label="Tutup modal"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Info karya */}
          <div className="mt-3 rounded-xl bg-ink-100 px-3 py-2.5">
            <p className="text-xs font-semibold text-ink line-clamp-1">{project.title}</p>
            <p className="text-xs text-ink-600 mt-0.5">
              {project.siswaNama} · {project.jurusanNama} · {project.year}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* Sukses state */}
          {success ? (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" aria-hidden="true" />
              </div>
              <div>
                <p className="font-heading text-base font-bold text-ink">
                  Minat berhasil dikirim!
                </p>
                <p className="text-sm text-ink-700 mt-1 max-w-[40ch] mx-auto leading-relaxed">
                  BKK akan meninjau permintaan Anda. Pantau statusnya di{" "}
                  <strong>Riwayat Permintaan</strong>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
              >
                Tutup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
                  {error}
                </div>
              )}

              {/* Pilih tujuan */}
              <div>
                <p className="text-sm font-semibold text-ink mb-2">
                  Tujuan pengajuan <span className="text-rose-500">*</span>
                </p>
                <div className="space-y-2">
                  {TUJUAN_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        tujuan === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-ink-150 hover:border-ink-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tujuan"
                        value={opt.value}
                        checked={tujuan === opt.value}
                        onChange={() => setTujuan(opt.value)}
                        className="mt-0.5 accent-primary"
                      />
                      <div>
                        <p className="text-sm font-semibold text-ink">{opt.label}</p>
                        <p className="text-xs text-ink-600">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pesan */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Pesan untuk BKK <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  rows={4}
                  placeholder="Jelaskan kebutuhan perusahaan Anda, posisi yang ditawarkan, dan alasan ketertarikan pada karya ini..."
                  className="w-full rounded-xl border border-ink-150 px-4 py-3 text-sm text-ink bg-ink-100/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
                />
                <p className={`mt-1 text-xs ${pesanOk ? "text-emerald-600" : "text-ink-300"}`}>
                  {pesan.trim().length}/{MIN_PESAN} karakter minimum
                </p>
              </div>

              {/* Info alur BKK */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                <p className="text-xs text-ink-700 leading-relaxed">
                  <span className="font-semibold text-primary">Ingat:</span> permintaan ini akan ditinjau
                  BKK sebelum diteruskan ke siswa. Anda tidak dapat menghubungi siswa secara langsung.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-ink-150 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !tujuan || !pesanOk}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      Kirim Minat
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
