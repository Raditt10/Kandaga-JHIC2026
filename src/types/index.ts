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
  name:     string;
  abbr:     string;          // singkatan untuk fallback
  logoUrl?: string;          // path di public/partners/ — opsional untuk backward compat
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
