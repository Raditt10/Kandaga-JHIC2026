import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { XCircle, Mail, RefreshCw, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Pendaftaran Tidak Disetujui — Kandaga Mitra",
  description: "Pendaftaran akun perusahaan Anda tidak dapat diproses oleh BKK SMKN 13 Bandung.",
};

/**
 * Halaman status akun ditolak oleh BKK.
 * Heading outline:
 *   h1: "Pendaftaran Tidak Dapat Diproses"
 *     h2: "Apa yang Bisa Dilakukan?"
 */
export default function MitraDitolakPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F6] via-white to-cream flex flex-col">

      {/* Mini navbar */}
      <header className="w-full pt-6 px-4">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md border border-ink-150 rounded-full px-6 py-3 flex items-center justify-between shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-full overflow-hidden ring-1 ring-ink/5">
              <Image src="/logo.png" alt="Kandaga" fill className="object-contain" priority />
            </div>
            <span className="font-heading font-extrabold text-base bg-gradient-to-r from-ink via-primary to-primary bg-clip-text text-transparent">
              KANDAGA
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Konten */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center space-y-8">

          {/* Ikon status */}
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-rose-600" aria-hidden="true" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Pendaftaran Tidak Dapat Diproses
            </h1>
            <p className="text-base text-ink-700 leading-relaxed max-w-[55ch] mx-auto">
              Setelah ditinjau oleh <strong>Koordinator BKK SMKN 13 Bandung</strong>,
              pendaftaran akun mitra Anda tidak dapat disetujui pada saat ini.
            </p>
          </div>

          {/* Card alasan & tindak lanjut */}
          <div className="bg-white rounded-3xl border border-ink-150 p-6 text-left space-y-5 shadow-sm">
            <h2 className="font-heading text-base font-semibold text-ink">
              Apa yang Bisa Dilakukan?
            </h2>

            <div className="space-y-4">
              {/* Opsi 1: hubungi BKK */}
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-ink-150 bg-ink-100/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Hubungi Koordinator BKK
                  </p>
                  <p className="text-sm text-ink-700 leading-relaxed mt-1 max-w-[45ch]">
                    Kirim email untuk menanyakan alasan penolakan dan kelengkapan
                    dokumen yang dibutuhkan.
                  </p>
                  <a
                    href="mailto:bkk@smkn13bandung.sch.id?subject=Klarifikasi%20Pendaftaran%20Mitra%20Kandaga"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    bkk@smkn13bandung.sch.id
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Opsi 2: daftar ulang */}
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-ink-150 bg-ink-100/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Daftar Ulang dengan Data Lengkap
                  </p>
                  <p className="text-sm text-ink-700 leading-relaxed mt-1 max-w-[45ch]">
                    Pastikan dokumen legalitas (NIB/NPWP/SK) sudah lengkap dan
                    menggunakan email perusahaan resmi sebelum mendaftar kembali.
                  </p>
                </div>
              </div>
            </div>

            {/* Catatan BKK — akan diisi catatan_bkk dari DB di iterasi berikutnya */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">Catatan:</span> Jika Anda menerima
                email klarifikasi dari BKK, ikuti instruksi di email tersebut sebelum
                mendaftar ulang.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 rounded-full border border-ink-150 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors text-center"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/mitra/daftar"
              className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors text-center"
            >
              Daftar Ulang
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
