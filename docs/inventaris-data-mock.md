# Inventaris Data Mock — Kandaga

Tanggal: 3 Oktober 2026
Aturan yang dipakai (dari pemilik proyek): *data dummy boleh dipakai selama sebuah fitur belum bisa memakai database asli, tetapi **wajib tinggal di dalam seed**. Di luar seed, data itu harus dipindahkan ke seed atau dihapus.*

---

## 1. Sudah ada di dalam seed (aman)

Setelah commit `17cf599`, `prisma/seed.ts` + `prisma/seed-demo.ts` mengisi:

| Tabel | Baris | Keterangan |
|---|---|---|
| `users` | 11 | 5 akun demo + 2 siswa tambahan + akun asli yang dipertahankan |
| `majors` | 3 | RPL, TKJ, Analis Kimia |
| `students` | 3 | satu per jurusan |
| `teachers` | 1 | guru13 (RPL) |
| `companies` | 4 | 3 dari seed + 1 pendaftaran lewat UI (dipertahankan) |
| `projects` | 8 | 6 tayang, 2 menunggu kurasi |
| `projects_media` | 16 | 2 foto per karya |
| `contact_requests` | 5 | 2 aktif, 3 riwayat |
| `tools_skills` | 14 | master alat |
| `project_tools` | 13 | relasi karya–alat + nama alat bebas |
| `projects_main_features` | 18 | 3 fitur utama per karya contoh |
| `badges` | 4 | gold, silver, bronze, industri |
| `projects_badge` | 4 | guru13 memberi 3 tier, bkk13 memberi "Diminati Industri" |
| `bookmarks` | 3 | milik mitra_perusahaan |
| `partnerships` | 1 | dari permintaan kontak yang sudah diteruskan |
| `notifications` | 5 | contoh untuk siswa, guru, mitra, dan BKK |
| `audit_logs` | 3 | contoh aksi approve, verifikasi mitra, teruskan kontak |

Semua operasi bersifat idempotent (`upsert` atau cek-lalu-buat), jadi menjalankan seed dua kali tidak menggandakan data.

---

## 2. Masih mock dan berada DI LUAR seed

### 2.1 `src/lib/users.ts` — 126 baris

Isi: `usersDatabase` (5 akun palsu), tipe `UserAccount`, dan helper `normalizeRole`, `findUserByEmailOrUsername`, `createUser`.
Dipakai oleh **2 file**:

| Pemakai | Baris | fetch | Akibat |
|---|---|---|---|
| `src/app/admin/pengguna/page.tsx` | 517 | 0 | daftar pengguna yang ditampilkan **bukan** isi database |
| `src/components/admin/AdminLayout.tsx` | — | — | badge angka di menu "Kelola Pengguna" memakai panjang array palsu |

Padanan di database sudah tersedia: tabel `users` (11 baris, lengkap dengan `role` dan `status`).

### 2.2 `src/lib/adminData.ts` — 232 baris

Isi: `systemAuditLogs`, `projectShowcases`, `mentorsList`, `recentIndustryPartners` (beserta tipe-tipenya), semuanya array statis.
Dipakai oleh **4 halaman admin** (keempatnya 0 `fetch`):

| Pemakai | Baris | Array yang dipakai | Padanan di database |
|---|---|---|---|
| `src/app/admin/dashboard/page.tsx` | 357 | `systemAuditLogs`, `projectShowcases`, `mentorsList` | `audit_logs`, `projects`, `teachers` |
| `src/app/admin/moderasi/page.tsx` | 265 | `projectShowcases` | `projects` (8 baris) |
| `src/app/admin/moderasi/[id]/page.tsx` | 394 | `projectShowcases` | `projects` |
| `src/app/admin/trend-karya/page.tsx` | 268 | `projectShowcases` + 2 array inline | `projects`, `projects_badge` |

### 2.3 `src/data/galleryData.ts` — 882 baris

Isi: `GALLERY_PROJECTS` (data karya statis), `STUDENT_PROFILES`, helper `getGalleryProjects`/`getProjectById`/`getStudentById`/`getRelatedProjects`/`getProjectsByStudentId`, dan yang penting: **tipe** `GalleryProjectItem` + `StudentProfileData`.
Dipakai oleh **10 file**: 2 route API (`/api/gallery`, `/api/gallery/[id]`), halaman galeri publik, `/siswa/[id]`, halaman `my-projects`, dan 3 komponen siswa.

Perlakuan yang tepat: **tipe dan helper tetap disimpan** (dipakai lintas file), sedangkan array datanya (`GALLERY_PROJECTS`, `STUDENT_PROFILES`) dihapus karena isinya sudah ada di seed sebagai 8 baris `projects`. Dengan begitu galeri publik membaca database, bukan data statis.

### 2.4 Data hardcoded lain di halaman

| File | Baris | Sifat | Catatan |
|---|---|---|---|
| `src/app/admin/blud/page.tsx` | 341 | 1 array inline | angka keuangan BLUD tidak punya tabelnya |
| `src/app/admin/pengaturan/page.tsx` | 167 | state lokal | opsi konfigurasi platform, tanpa API |
| `src/app/admin/pendaftaran-mitra/page.tsx` | 468 | **2 fetch** | sudah membaca database ✓ |

---

## 3. Yang dibutuhkan untuk memindahkannya ke seed

Perlu 3–4 route API admin baru agar halaman berhenti memakai array statis:

1. `GET /api/admin/pengguna` — daftar `users` + role + status (+ filter)
2. `GET /api/admin/audit-log` — `audit_logs` di-join ke `users`
3. `GET /api/admin/trend` — agregat karya per jurusan, status, dan badge
4. `GET /api/admin/mitra` — daftar `companies` untuk "recentIndustryPartners" dan mentor dari `teachers`

Setelah itu: hapus `src/lib/users.ts` dan `src/lib/adminData.ts`, dan pangkas data statis di `galleryData.ts`.

Untuk `admin/blud`, tabelnya belum ada di skema — pilihannya menambah tabel baru, atau menghapus halaman itu dari navigasi sampai datanya nyata.

---

## 4. Catatan urutan kerja

Halaman admin yang perlu disambungkan ke database (2.1 dan 2.2) adalah **file yang sama** dengan yang perlu diseragamkan gayanya ke token Kandaga (Tahap 3b). Karena keduanya menyentuh 5 file yang persis sama, sebaiknya dikerjakan dalam satu lintasan: sambungkan ke database sekaligus terapkan token desain. Menggayakan halaman yang isinya masih palsu berarti mengerjakan dua kali.

---

## 5. Status Tahap 2 dan 3

| Tahap | Status |
|---|---|
| Tahap 1 — Pengaturan semua role | selesai (`0bfd4e0`) |
| Tahap 2 — dashboard Siswa & Perusahaan membaca database | selesai (`a189934`) |
| Tahap 3a — chrome dashboard memakai token Kandaga | selesai (`1dd3dad`, `DashboardShell` + `AccountSettings`) |
| Tahap 3b — halaman (body) menyusul token | **belum**, dan paling efisien digabung dengan pekerjaan bagian 3 di atas |
