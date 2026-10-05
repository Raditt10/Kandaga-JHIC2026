import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, CheckCircle2, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  description: "Akun perusahaan Anda sedang ditinjau oleh Koordinator BKK SMKN 13 Bandung.",
};

/**
 * Halaman status setelah registrasi berhasil.
 * User TIDAK bisa mengakses dashboard sampai BKK menyetujui akun.
 * Heading outline:
 *   h1: "Pendaftaran Berhasil!"
 *     h2: "Langkah Selanjutnya"
 */
export default function MitraMenungguPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F6] via-white to-cream flex flex-col">

      {/* Mini navbar */}
      <header className="w-full pt-6 px-4">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md border border-ink-150 rounded-full px-6 py-3 flex items-center justify-between shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-full overflow-hidden ring-1 ring-ink/5">
              <Image src="/logo.png" alt="Kandaga" fill sizes="32px" className="object-contain" priority />
            </div>
            <span className="font-heading font-extrabold text-base bg-gradient-to-r from-ink via-primary to-primary bg-clip-text text-transparent">
              KANDAGA
            </span>
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-primary text-primary px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-white transition"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* Konten */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center space-y-8">

          {/* Ikon status */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <Clock className="w-10 h-10 text-primary" aria-hidden="true" />
              </div>
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" aria-hidden="true" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Pendaftaran Berhasil!
            </h1>
            <p className="text-base text-ink-700 leading-relaxed max-w-[55ch] mx-auto">
              Akun perusahaan Anda sudah dibuat dan sedang menunggu verifikasi
              dari <strong>Koordinator BKK SMKN 13 Bandung</strong>.
            </p>
          </div>

          {/* Card status */}
          <div className="bg-white rounded-3xl border border-ink-150 p-6 text-left space-y-5 shadow-sm">
            <h2 className="font-heading text-base font-semibold text-ink">
              Langkah Selanjutnya
            </h2>

            {/* Steps */}
            <ol className="space-y-4">
              {[
                {
                  no: "01",
                  done: true,
                  title: "Akun terdaftar",
                  desc: "Data perusahaan Anda berhasil tersimpan di sistem Kandaga.",
                },
                {
                  no: "02",
                  done: false,
                  title: "Tinjauan Koordinator BKK",
                  desc: "Tim BKK akan memeriksa kelengkapan data dan dokumen Anda. Proses berlangsung maksimal 1×24 jam kerja.",
                },
                {
                  no: "03",
                  done: false,
                  title: "Notifikasi persetujuan",
                  desc: "Anda akan menerima email konfirmasi setelah akun disetujui.",
                },
                {
                  no: "04",
                  done: false,
                  title: "Akses katalog talenta",
                  desc: "Setelah disetujui, login dan mulai menjelajahi portofolio siswa terverifikasi.",
                },
              ].map((s) => (
                <li key={s.no} className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    s.done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-ink-100 text-ink-600"
                  }`}>
                    {s.done
                      ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      : s.no}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${s.done ? "text-emerald-700" : "text-ink"}`}>
                      {s.title}
                    </p>
                    <p className="text-sm text-ink-600 leading-relaxed mt-0.5 max-w-[50ch]">
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Kontak BKK */}
          <div className="rounded-2xl border border-ink-150 bg-white p-5 text-left space-y-3">
            <p className="text-sm font-semibold text-ink">
              Ada pertanyaan? Hubungi BKK langsung:
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:bkk@smkn13bandung.sch.id"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors font-medium"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                bkk@smkn13bandung.sch.id
              </a>
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <Phone className="w-4 h-4 text-ink-300" aria-hidden="true" />
                Senin–Jumat 08.00–15.00 WIB
              </div>
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
              href="/auth/login"
              className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors text-center"
            >
              Masuk Setelah Diverifikasi
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
