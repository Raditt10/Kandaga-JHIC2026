import type { AdminNotification } from "@/types/notification";

export const initialAdminNotifications: AdminNotification[] = [
  {
    id: "notif-seed-1",
    type: "project_created",
    category: "project",
    title: "Karya Siswa Baru Diunggah",
    message: "Rizky Ramadhan (XII RPL 2) baru saja mengunggah karya 'Sistem Monitoring Presensi Berbasis Wajah & QR' ke antrean kurasi.",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago
    read: false,
    priority: "normal",
    metadata: {
      studentName: "Rizky Ramadhan",
      projectTitle: "Sistem Monitoring Presensi QR",
      badgeText: "RPL",
      url: "/admin/moderasi",
    },
  },
  {
    id: "notif-seed-2",
    type: "company_registered",
    category: "mitra",
    title: "Pendaftaran Mitra Industri Baru",
    message: "PT Astra Digital Nusantara mengajukan kemitraan industri ke BKK SMKN 13 dan menunggu persetujuan verifikasi legalitas.",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
    read: false,
    priority: "urgent",
    metadata: {
      companyName: "PT Astra Digital Nusantara",
      badgeText: "BKK",
      url: "/admin/bkk",
    },
  },
  {
    id: "notif-seed-3",
    type: "curation_review",
    category: "curation",
    title: "Catatan Kurasi Guru Pembimbing",
    message: "Drs. Budi Santoso (Guru Pembimbing) menyetujui proyek 'Platform Analisis Air Limbah Kimia' untuk dipublikasikan ke Galeri Utama.",
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 1 hr 15 mins ago
    read: true,
    priority: "success",
    metadata: {
      actor: "Drs. Budi Santoso",
      projectTitle: "Platform Analisis Air Limbah Kimia",
      badgeText: "Analis Kimia",
      url: "/admin/moderasi",
    },
  },
  {
    id: "notif-seed-4",
    type: "security_alert",
    category: "security",
    title: "Audit Keamanan & Hak Akses",
    message: "Pemberian peran BKK kepada pengguna 'bkk.smkn13' berhasil diverifikasi melalui audit log keamanan server.",
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3 hrs ago
    read: true,
    priority: "normal",
    metadata: {
      actor: "admin.kandaga",
      badgeText: "Audit",
      url: "/admin/audit-log",
    },
  },
];
