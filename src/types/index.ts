/**
 * Kandaga — Central Type Definitions
 * Semua t-
 */

// ─────────────────────────────────────────────
// NAVIGASI
// ─────────────────────────────────────────────

export type NavLink = {
  label: string;
  href: string;
};

// ─────────────────────────────────────────────
// JURUSAN
// ─────────────────────────────────────────────

export type JurusanSlug = "analis-kimia" | "tkj" | "rpl";

export type Jurusan = {
  slug: JurusanSlug;
  name: string;           // "Analis Kimia" | "TKJ" | "RPL"
  fullName: string;       // "Rekayasa Perangkat Lunak" dll
  image: string;          // path gambar hero jurusan
  link: string;           // route /jurusan/[slug]
  description: string;
};

// ─────────────────────────────────────────────
// KARYA / PROYEK
// ─────────────────────────────────────────────

export type ProjectStatus = "draft" | "pending" | "verified" | "featured";

export type Project = {
  id: string;             // slug unik, jadi URL-safe
  title: string;
  description: string;
  jurusan: JurusanSlug | "web" | string; // tag kategori
  image: string;          // thumbnail utama
  href: string;           // route detail /etalase/[id]
  status?: ProjectStatus;
  year?: number;
  author?: string;        // nama siswa (opsional untuk landing)
};

// ─────────────────────────────────────────────
// FILTER GALERI
// ─────────────────────────────────────────────

export type GalleryFilter = {
  value: string;
  label: string;
};

// ─────────────────────────────────────────────
// STATISTIK
// ─────────────────────────────────────────────

export type Stat = {
  value: number;
  suffix: string;         // "" | "+" | "×"
  label: string;
};

// ─────────────────────────────────────────────
// WHY SECTION (Fitur / Keunggulan)
// ─────────────────────────────────────────────

export type FeatureIconKey =
  | "verified"
  | "enterprise"
  | "school"
  | "factory"
  | "task"
  | "assignment"
  | "check"
  | "folder"
  | "users";

export type Feature = {
  number: string;         // "01" | "02" | "03"
  iconKey: FeatureIconKey;
  title: string;
  description: string;
};

// ─────────────────────────────────────────────
// MITRA INDUSTRI
// ─────────────────────────────────────────────

export type Partner = {
  name: string;           // nama lengkap perusahaan
  abbr: string;           // singkatan untuk placeholder logo
  logoUrl?: string;       // URL logo (opsional, diisi saat data asli tersedia)
  website?: string;
};

// ─────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────

export type FAQ = {
  id: string;             // slug unik
  q: string;              // pertanyaan
  a: string;              // jawaban
};

// ─────────────────────────────────────────────
// INDUSTRI SECTION (Benefits / Manfaat Mitra)
// ─────────────────────────────────────────────

export type Benefit = {
  code: string;           // "01" | "02" | "03"
  title: string;
  desc: string;
  tooltip: string;        // teks detail yang muncul di hotspot hover
};

// ─────────────────────────────────────────────
// MITRA / PERUSAHAAN
// ─────────────────────────────────────────────

export type VerificationStatus = "pending" | "disetujui" | "ditolak";

export type CompanyProfile = {
  userId:             string;
  name:               string;          // nama perusahaan
  field:              string | null;   // bidang usaha
  documentUrl:        string | null;   // URL dokumen legalitas (mock atau storage)
  verificationStatus: VerificationStatus;
  verifiedAt:         string | null;   // ISO timestamp
};

export type CompanyRegistrationInput = {
  namaKontak:     string;
  email:          string;
  password:       string;
  namaPerusahaan: string;
  bidang?:        string;
  dokumenUrl?:    string;
};

// Status permintaan kontak — mapping ke tabel permintaan_kontak
export type ContactRequestStatus =
  | "terkirim"
  | "ditinjau"
  | "klarifikasi"
  | "diteruskan"
  | "ditolak";

export type ContactRequest = {
  id:          string;
  projectId:   string;
  projectTitle: string;
  purpose:     "magang" | "kerja" | "kolaborasi";
  message:     string;
  status:      ContactRequestStatus;
  bkkNotes:    string | null;
  createdAt:   string;
  updatedAt:   string;
};

// ─────────────────────────────────────────────
// USER (placeholder untuk Fase 2 Auth)
// ─────────────────────────────────────────────

export type UserRole =
  | "siswa"
  | "guru"
  | "admin"
  | "bkk"
  | "perusahaan";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jurusan?: JurusanSlug;  // hanya untuk role siswa/guru
  avatar?: string;
};

// ─────────────────────────────────────────────
// GALLERY & PROJECT DETAIL TYPES
// ─────────────────────────────────────────────

export interface StudentProfileData {
  id: string;
  name: string;
  username: string;
  nis: string;
  class: string;
  major: JurusanSlug;
  majorName: string;
  generation: number;
  avatar: string;
  bio: string;
  currentCareer?: string;
  status: "aktif" | "alumni";
  isPrivate: boolean;
  privacyReason?: string;
  skills: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
    instagram?: string;
  };
  contactEmail?: string;
}

export interface GalleryProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  solutionHighlights: string[];
  major: JurusanSlug;
  majorLabel: string;
  jurusan?: JurusanSlug;
  jurusanLabel?: string;
  year: number;
  coverImage: string;
  galleryImages: string[];
  status: "verified" | "featured" | "draft" | "pending";
  badgeTier?: "gold" | "silver" | "bronze";
  badgeLabel?: string;
  tools: string[];
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentClass: string;
  isStudentPrivate: boolean;
  isPrivate?: boolean;
  createdAt?: string;
  updatedAt?: string;
  advisor: {
    name: string;
    role: string;
    reviewNotes: string;
  };
  metrics: {
    views: number;
    likes: number;
  };
  links?: {
    demoUrl?: string;
    githubUrl?: string;
    docUrl?: string;
  };
}

export interface ProjectShowcase {
  id: string;
  title: string;
  category: string;
  image: string;
  author: string;
  authorRole: string;
  likes: number;
  description: string;
  uploadOrder?: number;
  uploadedAt?: string;
  status?: string;
}

export type Role = "student" | "admin" | "company" | "teacher" | "bkk";

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: Role;
  status?: string;
  createdAt?: string;
}

export type ProjectDocumentType = "pdf" | "image" | "link" | "video";

export interface ProjectDocument {
  id: string;
  name: string;
  type: ProjectDocumentType;
  url: string | null;
  meta?: string;
  required?: boolean;
}

export interface CreatorProfile {
  name: string;
  className: string;
  major: string;
  email: string;
  advisor: string;
  joinedAt: string;
  verifiedWorks: number;
  avatar: string;
  bio?: string;
  role?: string;
  nis?: string;
}

