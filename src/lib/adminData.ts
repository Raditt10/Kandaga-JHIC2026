export interface SystemAuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  detail: string
  status: "SUCCESS" | "FAILED" | "PENDING"
}

export interface ProjectShowcase {
  id: string
  title: string
  category: string
  image: string
  author: string
  authorRole: string
  likes: number
  description: string
  uploadOrder?: number
  uploadedAt?: string
}

export interface MentorItem {
  name: string
  role: string
  initial: string
}

export const systemAuditLogs: SystemAuditLog[] = [
  {
    id: "log-1",
    timestamp: "02 Okt 2026, 15:20 WIB",
    user: "admin.kandaga",
    action: "ROLE_ASSIGNMENT",
    detail: "Menetapkan peran BKK kepada pengguna bkk.smkn13",
    status: "SUCCESS",
  },
  {
    id: "log-2",
    timestamp: "02 Okt 2026, 14:45 WIB",
    user: "guru.pembimbing",
    action: "CURATION_APPROVAL",
    detail: "Menyetujui proyek 'EduClass — LMS & Presensi QR' ke Galeri Utama",
    status: "SUCCESS",
  },
  {
    id: "log-3",
    timestamp: "02 Okt 2026, 11:10 WIB",
    user: "pt.mitra-industri",
    action: "INTERNSHIP_POSTED",
    detail: "Membuka lowongan magang PKL 'Junior Frontend Engineer'",
    status: "SUCCESS",
  },
  {
    id: "log-4",
    timestamp: "01 Okt 2026, 21:05 WIB",
    user: "siswa.smkn13",
    action: "PROJECT_SUBMISSION",
    detail: "Mengunggah proyek tugas akhir baru ke antrean kurasi",
    status: "SUCCESS",
  },
]

export const projectShowcases: ProjectShowcase[] = [
  {
    id: "proj-1",
    title: "EduClass — Platform Presensi QR & LMS",
    category: "RPL",
    image: "/images/preview-rpl.jpg",
    author: "Bayu Salto",
    authorRole: "Siswa RPL",
    likes: 42,
    description: "Sistem presensi digital berbasis QR dinamis dengan modul LMS dan rekapitulasi kehadiran otomatis siswa.",
    uploadOrder: 1,
    uploadedAt: "28 Sep 2026",
  },
  {
    id: "proj-2",
    title: "SmartMonitoring — IoT Sensor Kimia Terpadu",
    category: "TKJ",
    image: "/images/preview-iot.jpg",
    author: "Leonardo Samsul",
    authorRole: "Siswa TKJ",
    likes: 38,
    description: "Sensor IoT pemantau suhu, pH, dan kelembapan secara real-time dengan dashboard telemetri nirkabel terpadu.",
    uploadOrder: 2,
    uploadedAt: "29 Sep 2026",
  },
  {
    id: "proj-3",
    title: "AquaPure — Pengujian Baku Mutu Air Industri",
    category: "Analis Kimia",
    image: "/images/preview-kimia.jpg",
    author: "Padhang Satrio",
    authorRole: "Siswa Analisis Kimia",
    likes: 56,
    description: "Analisis parameter kualitas air limbah industri berbasis spektrofotometri sesuai standar pengujian ISO 17025.",
    uploadOrder: 3,
    uploadedAt: "29 Sep 2026",
  },
  {
    id: "proj-4",
    title: "NetGuard — Firewall & Traffic Monitor Sekolah",
    category: "TKJ",
    image: "/images/hero-tkj.jpg",
    author: "Fajar Pratama",
    authorRole: "Siswa TKJ",
    likes: 29,
    description: "Arsitektur keamanan jaringan lokal sekolah dengan rule traffic limiter dan filter konten berbahaya otomatis.",
    uploadOrder: 4,
    uploadedAt: "30 Sep 2026",
  },
  {
    id: "proj-5",
    title: "BioKandaga — Ekstraksi Minyak Atsiri Lokal",
    category: "Analis Kimia",
    image: "/images/hero-kimia.jpg",
    author: "Nabila Azzahra",
    authorRole: "Siswa Analisis Kimia",
    likes: 47,
    description: "Metode distilasi uap fraksinasi tanaman serai wangi guna menghasilkan minyak atsiri bernilai ekonomis tinggi.",
    uploadOrder: 5,
    uploadedAt: "01 Okt 2026",
  },
  {
    id: "proj-6",
    title: "KandagaMart — Point of Sale & Inventory Multi-Cabang",
    category: "RPL",
    image: "/images/hero-kolaborasi.jpg",
    author: "Rian Hidayat",
    authorRole: "Siswa RPL",
    likes: 64,
    description: "Aplikasi kasir web responsif terintegrasi laporan stok barang dan sinkronisasi offline-first PWA.",
    uploadOrder: 6,
    uploadedAt: "01 Okt 2026",
  },
  {
    id: "proj-7",
    title: "CloudLab — Virtual Private Server untuk Praktikum",
    category: "TKJ",
    image: "/images/preview-iot.jpg",
    author: "Dimas Wicaksono",
    authorRole: "Siswa TKJ",
    likes: 31,
    description: "Cluster containerization berbasis Proxmox untuk penyediaan lab virtual siswa secara on-demand.",
    uploadOrder: 7,
    uploadedAt: "02 Okt 2026",
  },
  {
    id: "proj-8",
    title: "ChemSpectra — Kolorimetri Digital Sampel Tanah",
    category: "Analis Kimia",
    image: "/images/preview-kimia.jpg",
    author: "Siti Rahmawati",
    authorRole: "Siswa Analisis Kimia",
    likes: 51,
    description: "Pengukuran kandungan hara NPK tanah pertanian menggunakan sensor spektrum warna terkalibrasi.",
    uploadOrder: 8,
    uploadedAt: "02 Okt 2026",
  },
  {
    id: "proj-9",
    title: "AgriTech — Kontrol Irigasi Hidroponik Cerdas",
    category: "RPL",
    image: "/images/preview-rpl.jpg",
    author: "Alif Kurniawan",
    authorRole: "Siswa RPL",
    likes: 43,
    description: "Aplikasi dashboard dan kontroler mikrokontroler untuk automasi penjadwalan nutrisi nutrisi hidroponik.",
    uploadOrder: 9,
    uploadedAt: "02 Okt 2026",
  },
]

export const mentorsList: MentorItem[] = [
  { name: "Padhang Satrio", role: "Guru Pembimbing", initial: "PS" },
  { name: "Zakir Horizontal", role: "Koordinator BKK", initial: "ZH" },
  { name: "Leonardo Samsul", role: "Admin Infrastruktur", initial: "LS" },
]

export interface RecentIndustryPartner {
  id: string
  name: string
  field: string
  initial: string
  badge: string
  quotaSiswa: number
  targetJurusan: string[]
  positions: string[]
  mouDate: string
  contactPerson: string
}

export const recentIndustryPartners: RecentIndustryPartner[] = [
  {
    id: "ind-1",
    name: "PT Telkom Indonesia (Digital Service)",
    field: "Telekomunikasi & Software Cloud",
    initial: "TL",
    badge: "MoU Baru",
    quotaSiswa: 6,
    targetJurusan: ["RPL", "TKJ"],
    positions: ["Frontend Engineer", "Cloud Infrastructure"],
    mouDate: "MoU aktif 2 hari lalu",
    contactPerson: "Bpk. Hendra Gunawan",
  },
  {
    id: "ind-2",
    name: "PT Kimia Farma Industri Tbk",
    field: "Farmasi & Riset Kimia Terapan",
    initial: "KF",
    badge: "MoU Baru",
    quotaSiswa: 4,
    targetJurusan: ["Analis Kimia"],
    positions: ["QC Lab Analyst", "Sampling Baku Mutu"],
    mouDate: "MoU aktif 4 hari lalu",
    contactPerson: "Ibu Ratna Dewi",
  },
  {
    id: "ind-3",
    name: "BukaStudio Software House",
    field: "Web & Mobile App Development",
    initial: "BS",
    badge: "Kerja Sama Aktif",
    quotaSiswa: 3,
    targetJurusan: ["RPL"],
    positions: ["React Developer", "UI/UX Designer"],
    mouDate: "MoU aktif minggu ini",
    contactPerson: "Bpk. Aris Munandar",
  },
]
