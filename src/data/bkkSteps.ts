/**
 * Alur kerja BKK — sumber tunggal untuk:
 *   - section landing page  (src/components/landing/BKKSection.tsx)
 *   - halaman publik         (/mitra/cara-kerja-bkk)
 *
 * Sebelumnya isi ini hanya hidup di dalam BKKSection. Dipindahkan ke sini
 * supaya halaman publik tidak menyalin ulang teksnya — dua salinan teks
 * yang sama pasti akan berbeda begitu salah satunya diedit.
 */

export type BkkStep = {
  no: string;
  title: string;
  desc: string;
};

export type BkkFaq = {
  q: string;
  a: string;
};

export const bkkSteps: BkkStep[] = [
  {
    no: "01",
    title: "Daftar akun perusahaan",
    desc: "Isi formulir pendaftaran dan unggah dokumen legalitas perusahaan (NIB, NPWP, atau SK).",
  },
  {
    no: "02",
    title: "Verifikasi oleh Koordinator BKK",
    desc: "Tim BKK meninjau kelengkapan dokumen. Proses verifikasi berlangsung dalam 1×24 jam kerja.",
  },
  {
    no: "03",
    title: "Akses katalog karya siswa",
    desc: "Akun terverifikasi dapat menelusuri dan memfilter katalog portofolio berdasarkan jurusan, skill, atau badge prestasi.",
  },
  {
    no: "04",
    title: "Kirim minat melalui sistem",
    desc: "Sampaikan minat rekrutmen atau kerja sama PKL melalui platform — tidak ada kontak langsung ke siswa.",
  },
  {
    no: "05",
    title: "BKK meneruskan ke siswa & guru",
    desc: "BKK memverifikasi minat dan menghubungkan Anda dengan siswa serta guru pembimbing terkait untuk tindak lanjut.",
  },
];

export const bkkFaqs: BkkFaq[] = [
  {
    q: "Berapa lama proses verifikasi akun perusahaan?",
    a: "Maksimal 1×24 jam kerja. Tim BKK akan menghubungi narahubung yang terdaftar melalui email atau WhatsApp.",
  },
  {
    q: "Apakah bisa digunakan untuk kebutuhan PKL saja?",
    a: "Ya. Selain rekrutmen, platform ini juga mendukung penempatan PKL dan kerja sama proyek kolaboratif.",
  },
  {
    q: "Siapa yang bisa dihubungi jika ada kendala?",
    a: "Hubungi Koordinator BKK SMKN 13 Bandung melalui email bkk@smkn13bandung.sch.id atau WhatsApp di jam layanan.",
  },
];
