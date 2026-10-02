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
    category: "FRONT END",
    image: "/images/preview-rpl.jpg",
    author: "Bayu Salto",
    authorRole: "Siswa RPL",
    likes: 42,
  },
  {
    id: "proj-2",
    title: "SmartMonitoring — IoT Sensor Kimia Terpadu",
    category: "IOT / HARDWARE",
    image: "/images/preview-iot.jpg",
    author: "Leonardo Samsul",
    authorRole: "Siswa TKJ",
    likes: 38,
  },
  {
    id: "proj-3",
    title: "AquaPure — Pengujian Baku Mutu Air Industri",
    category: "ANALISIS KIMIA",
    image: "/images/preview-kimia.jpg",
    author: "Padhang Satrio",
    authorRole: "Siswa Analisis Kimia",
    likes: 56,
  },
]

export const mentorsList: MentorItem[] = [
  { name: "Padhang Satrio", role: "Guru Pembimbing", initial: "PS" },
  { name: "Zakir Horizontal", role: "Koordinator BKK", initial: "ZH" },
  { name: "Leonardo Samsul", role: "Admin Infrastruktur", initial: "LS" },
]
