# 🏛️ Kandaga — Galeri Digital & Portal Industri SMKN 13 Bandung

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Kandaga** adalah etalase digital dan portal kolaborasi industri resmi untuk karya terbaik siswa-siswi SMKN 13 Bandung. Platform ini menghubungkan karya portofolio siswa dari tiga Kompetensi Keahlian utama (**Rekayasa Perangkat Lunak**, **Teknik Komputer Jaringan**, dan **Analis Kimia**) dengan proses verifikasi sekolah serta mitra industri nasional.

---

## 🎯 Purpose of the Project

- **Portofolio Terverifikasi Sekolah**: Memfasilitasi siswa untuk memamerkan proyek tugas akhir, aplikasi web/mobile, infrastruktur jaringan, serta hasil laboratorium riset yang telah dikurasi dan disetujui oleh Guru Pembimbing.
- **Hub Kerjasama Industri & PKL**: Memungkinkan Mitra Perusahaan (*Company*) dan Bursa Kerja Khusus (*BKK*) untuk mengeplorasi talenta siswa, memberikan sertifikasi kompetensi, serta membuka kesempatan magang/rekrutmen secara langsung.
- **Multi-Role Access Control (RBAC)**: Menyediakan 5 portal dashboard khusus yang disesuaikan dengan kebutuhan setiap pemangku kepentingan (*Student, Teacher, Company, Admin, BKK*).

---

## 🔐 Role-Based Access Control (RBAC)

Platform Kandaga mengimplementasikan proteksi rute ketat via `src/proxy.ts` (Next.js 16 Proxy convention) untuk 5 peran pengguna:

| Role | Domain utama | Deskripsi & Hak Akses |
| :--- | :--- | :--- |
| 🎓 **Student** | `/student` | Unggah karya portofolio, pantau status verifikasi guru, dan cek review dari perusahaan. |
| 🏢 **Company** | `/company` | Jelajahi karya siswa terverifikasi, buka posisi magang PKL, dan undang wawancara. |
| 👨‍🏫 **Teacher** | `/teacher` | Menilai dan memverifikasi kelayakan karya siswa serta menyetujui publikasi galeri. |
| 🛡️ **Admin** | `/admin` | Kontrol penuh manajemen pengguna, penetapan peran (*Role*), dan audit log sistem. |
| 💼 **BKK** | `/bkk` | Kelola bursa kerja lulusan/alumni, informasi *Job Fair*, dan indikator *Tracer Study*. |

---

## 🛠️ Technology Stack & Tools

### Core Framework & Logic
- **Next.js 16.3.6 (App Router & Turbopack)**: Web framework modern berbasis React 19.
- **TypeScript 5**: Type-safe development pada client, API routes, dan database models.
- **NextAuth.js 4**: Autentikasi berbasis JWT session dengan Support Credentials & OAuth Providers.
- **Next.js `proxy.ts`**: Middleware proxy penanganan keamananan rute RBAC.

### Database & Persistence
- **PostgreSQL**: Relational database engine dengan dukungan ekstensi `citext` dan `pgcrypto`.
- **Prisma ORM 6.19**: Type-safe ORM untuk manajemen schema, migrasi, dan *seeding* database.

### UI Design & Visuals
- **Tailwind CSS v4**: Utility-first CSS framework untuk visual modern, glassmorphism, dan responsivitas.
- **Lucide Icons**: Library ikon vektor modern.
- **Google Fonts**: Font Poppins, Inter, dan Tangerine untuk tipografi premium.

### Animations & Smooth Scroll
- **Motion (`motion/react`)**: Animasi interaktif card deck, transition, dan AnimatePresence.
- **GSAP**: Micro-animations & interactive elements.
- **Lenis Smooth Scroll**: Pengalaman scrolling mulus di seluruh halaman utama.

---

## 📁 Project Structure

```text
Kandaga/
├── prisma/
│   ├── schema.prisma          # Definisi model data PostgreSQL (Users, Student, Teacher, Company, Major, Projects, etc.)
│   └── seed.ts                # Script seeding data awal pengguna dan jurusan
├── public/                    # Asset gambar, logo, dan sampel media galeri
├── src/
    ├── app/                   # Next.js 16 App Router
    │   ├── api/               # API Routes
    │   ├── auth/              # Halaman Login & Registrasi
    │   └── page.tsx           # Interactive Landing Page
    ├── components/            # Reusable UI & Layout Components
    │   ├── landing/           # Hero, GallerySection, Stats, JurusanMenu, IndustrySection, FAQ
    │   ├── layout/            # Navbar (Session-Aware), Footer, SmoothScrollProvider\
    │   └── ui/                # UI Components (Buttons, Cards, Modals, etc.)
    ├── lib/                   # Utility helpers, database mock/client, & animation variants
    └── proxy.ts               # Next.js 16 Proxy RBAC route protection
```

---

## 💻 Development Environment Setup

Ikuti step berikut ini untuk membangun Kandaga di local environment Anda.

### 1. System Prequesities
Pastikan device Anda telah terpasang:
- **Node.js**: `v18.17.0` atau versi lebih baru (`v20+` direkomendasikan)
- **Package Manager**: `pnpm` atau `npm`
- **PostgreSQL**: Local server PostgreSQL atau cloud database (Supabase/Neon/Railway).

---

### 2. Clone Repository & Install Dependencies

```bash
# Kloning repositori
git clone https://github.com/Raditt10/Kandaga-JHIC2026.git
cd Kandaga-JHIC2026

# Install dependensi menggunakan npm, pnpm atau package manager lainnya
npm install
```

---

### 3. Konfigurasi Environment Variables (`.env`)

Buat file `.env` di direktori utama proyek (*root*) dan sesuaikan variabel berikut:

```env
# Database Connection String (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/kandaga_db?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="<NEXTAUTH_KEY>"
NEXTAUTH_URL="http://localhost:3000"
```

---

### 4. Setup Database & Seeding Data

Jalankan perintah Prisma untuk menerapkan struktur database dan mengisi data sampel awal:

```bash
# Push schema Prisma ke database PostgreSQL Anda
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Jalankan script seed data awal (Pengguna 5 Role & Jurusan)
npx prisma db seed
```

---

### 5. Jalankan Server Development

```bash
npm run dev
```

Buka browser Anda dan akses:
**[http://localhost:3000](http://localhost:3000)**

---

### 6. Verifikasi Build Produksi

Untuk memverifikasi kompilasi produksi tanpa error:

```bash
# Pembersihan cache & build Next.js
rm -rf .next
npm run build

# Jalankan server produksi
npm run start
```

