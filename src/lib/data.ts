/**
 * Kandaga — Static Data Layer
 *
 * Semua data statis landing page terpusat di sini.
 * Saat Fase 2 (database), fungsi-fungsi di bawah ini bisa
 * diganti dengan pemanggilan API/Prisma tanpa mengubah komponen —
 * komponen hanya perlu import dari sini, bukan dari file lain.
 *
 * Konvensi penamaan:
 *   - Variabel data: UPPER_SNAKE_CASE (konstan, tidak berubah runtime)
 *   - Fungsi getter: camelCase, awalan "get"
 */

import type {
  NavLink,
  Jurusan,
  Project,
  GalleryFilter,
  Stat,
  Feature,
  Partner,
  FAQ,
  Benefit,
} from "@/types";

// ─────────────────────────────────────────────
// NAVIGASI
// ─────────────────────────────────────────────

export const FOOTER_NAV_LINKS: NavLink[] = [
  { label: "Beranda",     href: "/" },
  { label: "Gallery",     href: "/galeri" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "About",       href: "/tentang" },
  { label: "Kontak",      href: "/kontak" },
];

export const FOOTER_LAYANAN_LINKS: NavLink[] = [
  { label: "Verifikasi Karya", href: "/verifikasi" },
  { label: "Akademi",          href: "/akademi" },
  { label: "Komunitas",        href: "/komunitas" },
];

export const FOOTER_INDUSTRI_LINKS: NavLink[] = [
  { label: "Cari Talenta",    href: "/talenta" },
  { label: "Daftar Mitra",    href: "/mitra" },
  { label: "Program Magang",  href: "/magang" },
  { label: "Hubungi Kami",    href: "/kontak" },
];

// ─────────────────────────────────────────────
// JURUSAN
// ─────────────────────────────────────────────

export const JURUSAN_LIST: Jurusan[] = [
  {
    slug: "analis-kimia",
    name: "Analis Kimia",
    fullName: "Analis Kimia",
    image: "/images/hero-kimia.jpg",
    link: "/jurusan/analis-kimia",
    description:
      "Jurusan yang berfokus pada analisis laboratorium, pengujian bahan kimia, dan riset berbasis sains terapan.",
  },
  {
    slug: "tkj",
    name: "TKJ",
    fullName: "Teknik Komputer Jaringan",
    image: "/images/hero-tkj.jpg",
    link: "/jurusan/tkj",
    description:
      "Jurusan yang mempelajari infrastruktur jaringan komputer, keamanan sistem, dan administrasi server.",
  },
  {
    slug: "rpl",
    name: "RPL",
    fullName: "Rekayasa Perangkat Lunak",
    image: "/images/preview-rpl.jpg",
    link: "/jurusan/rpl",
    description:
      "Jurusan yang fokus pada pengembangan aplikasi web, mobile, dan sistem informasi berbasis kode.",
  },
];

/** Helper: ambil satu jurusan berdasarkan slug */
export function getJurusan(slug: string): Jurusan | undefined {
  return JURUSAN_LIST.find((j) => j.slug === slug);
}

// ─────────────────────────────────────────────
// GALERI — FILTER
// ─────────────────────────────────────────────

export const GALLERY_FILTERS: GalleryFilter[] = [
  { value: "Semua",       label: "Semua" },
  { value: "RPL",         label: "RPL" },
  { value: "TKJ",         label: "TKJ" },
  { value: "Analis Kimia", label: "Analis Kimia" },
  { value: "Terbaru",     label: "Terbaru" },
  { value: "Populer",     label: "Populer" },
];

// ─────────────────────────────────────────────
// GALERI — KARYA (data dummy, ganti dengan API Fase 2)
// ─────────────────────────────────────────────

export const FEATURED_PROJECTS: Project[] = [
  {
    id: "riset-logam-berat",
    title: "Riset Analisis Kadar Logam Berat",
    description:
      "Penelitian laboratorium tentang kadar logam berat pada sampel air sungai di sekitar Bandung.",
    jurusan: "analis-kimia",
    image: "/images/preview-kimia.jpg",
    href: "/etalase/riset-logam-berat",
    status: "verified",
    year: 2025,
  },
  {
    id: "absensi-iot",
    title: "Sistem Absensi Wajah Berbasis IoT",
    description:
      "Karya TKJ yang memanfaatkan pengenalan wajah untuk mencatat kehadiran siswa secara otomatis.",
    jurusan: "web",
    image: "/images/preview-iot.jpg",
    href: "/etalase/absensi-iot",
    status: "featured",
    year: 2025,
  },
  {
    id: "manajemen-perpustakaan",
    title: "Aplikasi Manajemen Perpustakaan",
    description:
      "Sistem manajemen perpustakaan digital dengan fitur pencarian, peminjaman, dan notifikasi.",
    jurusan: "rpl",
    image: "/images/preview-rpl.jpg",
    href: "/etalase/manajemen-perpustakaan",
    status: "verified",
    year: 2025,
  },
  {
    id: "kolaborasi-siswa",
    title: "Platform Kolaborasi Siswa",
    description:
      "Web app untuk koordinasi proyek antar jurusan dengan fitur task management dan chat real-time.",
    jurusan: "rpl",
    image: "/images/hero-kolaborasi.jpg",
    href: "/etalase/kolaborasi-siswa",
    status: "verified",
    year: 2024,
  },
  {
    id: "monitoring-jaringan",
    title: "Monitoring Jaringan Sekolah",
    description:
      "Dashboard monitoring kondisi jaringan LAN sekolah dengan alert otomatis saat terjadi gangguan.",
    jurusan: "tkj",
    image: "/images/hero-tkj.jpg",
    href: "/etalase/monitoring-jaringan",
    status: "verified",
    year: 2024,
  },
];

/** Helper: ambil karya berdasarkan id */
export function getProject(id: string): Project | undefined {
  return FEATURED_PROJECTS.find((p) => p.id === id);
}

/** Helper: filter karya berdasarkan jurusan/tag */
export function getProjectsByJurusan(jurusan: string): Project[] {
  if (jurusan === "Semua") return FEATURED_PROJECTS;
  return FEATURED_PROJECTS.filter(
    (p) => p.jurusan.toLowerCase() === jurusan.toLowerCase()
  );
}

// ─────────────────────────────────────────────
// STATISTIK
// ─────────────────────────────────────────────

export const STATS: Stat[] = [
  { value: 3,   suffix: "",  label: "Jurusan Aktif" },
  { value: 200, suffix: "+", label: "Karya Terdokumentasi" },
  { value: 50,  suffix: "+", label: "Siswa Berkontribusi" },
  { value: 15,  suffix: "+", label: "Guru Pembimbing" },
];

// ─────────────────────────────────────────────
// WHY SECTION — FITUR / KEUNGGULAN
// ─────────────────────────────────────────────
// Catatan: field iconKey (bukan komponen Icon langsung) supaya data
// ini bisa diserialisasi (JSON-safe) dan siap untuk Fase 2 API.
// Resolving iconKey → komponen SVG dilakukan di WhySection.tsx.
// ─────────────────────────────────────────────

export const FEATURES: Feature[] = [
  {
    number: "01",
    iconKey: "check",
    title: "Terverifikasi Sekolah",
    description:
      "Setiap karya melewati proses kurasi dan verifikasi oleh guru pembimbing sebelum ditampilkan ke publik.",
  },
  {
    number: "02",
    iconKey: "folder",
    title: "Terbuka untuk Industri",
    description:
      "Perusahaan dan rekruter dapat langsung menjelajahi portofolio siswa dan menemukan bakat sesuai kebutuhan.",
  },
  {
    number: "03",
    iconKey: "users",
    title: "Milik Siswa, Diakui Sekolah",
    description:
      "Kandaga memastikan karya tetap menjadi portofolio pribadi siswa sekaligus bagian dari rekam jejak resmi sekolah.",
  },
];

// ─────────────────────────────────────────────
// MITRA INDUSTRI
// ─────────────────────────────────────────────

export const PARTNERS: Partner[] = [
  { name: "PT Telkom Indonesia",          abbr: "TLK" },
  { name: "PT Bandung Techno Park",       abbr: "BTP" },
  { name: "CV Inovasi Digital",           abbr: "IDG" },
  { name: "PT Aplikasi Karya Anak Bangsa", abbr: "AKAB" },
  { name: "Dinas Pendidikan Jabar",       abbr: "DIKJ" },
  { name: "PT Global Teknologi",          abbr: "GTK" },
];

// ─────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────

export const FAQS: FAQ[] = [
  {
    id: "siapa-mitra",
    q: "Siapa yang bisa mendaftar sebagai mitra industri?",
    a: "Perusahaan, UMKM, lembaga, atau instansi pemerintah yang ingin mengakses portofolio siswa SMKN 13 Bandung untuk keperluan rekrutmen, kerja sama PKL, atau riset. Pendaftaran diverifikasi oleh Koordinator BKK sekolah sebelum akun aktif.",
  },
  {
    id: "biaya",
    q: "Apakah ada biaya untuk menjadi mitra?",
    a: "Tidak. Akses katalog karya dan fitur pencarian talenta sepenuhnya gratis untuk mitra industri yang sudah terverifikasi. Kandaga adalah platform resmi sekolah, bukan layanan komersial.",
  },
  {
    id: "verifikasi",
    q: "Berapa lama proses verifikasi akun perusahaan?",
    a: "Proses verifikasi biasanya berlangsung 1–3 hari kerja. Tim BKK akan menghubungi narahubung yang didaftarkan melalui email atau telepon untuk konfirmasi. Pastikan data perusahaan yang diisi lengkap dan valid.",
  },
  {
    id: "upload-karya",
    q: "Sebagai siswa, bagaimana cara mengunggah karya ke Kandaga?",
    a: "Karya tidak dapat diunggah langsung oleh siswa — setiap karya harus diajukan melalui guru pembimbing jurusan untuk dikurasi terlebih dahulu. Hubungi guru pembimbing di jurusan masing-masing (RPL, TKJ, atau Analis Kimia) untuk memulai proses pengajuan.",
  },
  {
    id: "bkk",
    q: "Apa itu BKK dan apa perannya di Kandaga?",
    a: "BKK (Bursa Kerja Khusus) adalah unit resmi di SMKN 13 Bandung yang bertugas memfasilitasi hubungan antara siswa/alumni dengan dunia industri. Di Kandaga, BKK berperan sebagai verifikator akun mitra dan fasilitator komunikasi antara perusahaan dengan siswa/guru.",
  },
];

// ─────────────────────────────────────────────
// INDUSTRI SECTION — BENEFITS
// ─────────────────────────────────────────────

export const BENEFITS: Benefit[] = [
  {
    code: "01",
    title: "Akses talenta terverifikasi",
    desc: "Portofolio yang sudah dikurasi guru pembimbing, bukan unggahan bebas.",
    tooltip: "Setiap karya disetujui minimal satu guru pembimbing sebelum tayang.",
  },
  {
    code: "02",
    title: "Filter sesuai kebutuhan",
    desc: "Cari berdasarkan jurusan, skill, dan jenis karya secara spesifik.",
    tooltip:
      "Filter tersedia: jurusan, tahun, kategori proyek, dan teknologi yang dipakai.",
  },
  {
    code: "03",
    title: "Proses resmi lewat BKK sekolah",
    desc: "Setiap kontak difasilitasi dan diverifikasi pihak sekolah.",
    tooltip:
      "BKK memastikan komunikasi terlindungi — siswa tidak dihubungi langsung tanpa persetujuan.",
  },
];
