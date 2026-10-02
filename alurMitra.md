# alurMitra.md — Alur Program & Rencana Implementasi Mitra Perusahaan (DUDI/BKK)

> Dokumen ini untuk ditugaskan ke AI coding agent. **Baca `AGENTS.md` dulu**
> sebelum dokumen ini — itu konteks proyek secara umum, ini konteks 1 fitur
> spesifik: alur akun Perusahaan/Mitra, dari registrasi sampai mendapat
> balasan dari sekolah.
>
> **Cara pakai dokumen ini (untuk kamu, bukan untuk agent):** jangan
> tempel seluruh file ini ke 1 prompt agent sekaligus. Beri **1 Fase** dari
> §4 per sesi kerja. Tiap fase sengaja dibuat kecil dan berdiri sendiri
> supaya agent tidak kehilangan fokus/konteks di tengah jalan, dan supaya
> kamu bisa review hasilnya sebelum lanjut ke fase berikutnya.

---

## 0. Yang Sudah Ada vs Yang Belum (baca dulu sebelum mulai)

**Sudah jadi kode nyata:** section publik "Untuk Industri & Mitra" di
landing page (headline "Rekrut talenta yang sudah teruji, bukan tebakan",
3 poin manfaat dengan leader-line, tombol "Daftar Sebagai Mitra Industri",
link "Pelajari cara kerja BKK") — ini **tidak perlu dikerjakan ulang**.
Satu catatan kecil: ilustrasi blueprint di kanan masih placeholder abu-abu
berlabel "200 × 140 px" — itu perlu diganti aset SVG final
(`DimensionLine` dari `updateLanding.md` sudah punya kode dasarnya), tapi
ini kosmetik, bukan prioritas fase di bawah.

**Belum ada sama sekali:** semua yang terjadi setelah tombol itu diklik —
form registrasi, proses verifikasi, login, dashboard perusahaan, jelajah
katalog dari sisi perusahaan, form ajukan minat, dan halaman riwayat.
Itu semua yang dirinci di §4.

---

## 1. Alur End-to-End (gambaran utuh dulu, sebelum masuk detail per-fase)

```
[Publik] Klik "Daftar Sebagai Mitra Industri"
   ↓
[Form Registrasi] isi data kontak + data perusahaan + dokumen legalitas
   ↓
[Status: menunggu] akun dibuat, TIDAK bisa akses katalog dulu
   ↓
[Koordinator BKK meninjau] (di luar scope dokumen ini — lihat AGENTS.md §5)
   ↓                                    ↓
[Disetujui]                        [Ditolak]
   ↓                                    ↓
[Login berhasil]                  [Login diblokir, pesan alasan ditolak]
   ↓
[Dashboard Perusahaan]
   ├─ Jelajahi Katalog → Detail Karya → "Ajukan Minat via BKK"
   │     ↓
   │  [Permintaan masuk, status: terkirim]
   │     ↓ (ditinjau BKK, lihat AGENTS.md §5)
   │  [ditinjau] → [klarifikasi | diteruskan | ditolak]
   │
   ├─ Talenta Tersimpan (bookmark)
   ├─ Riwayat Permintaan (lihat semua status di atas)
   └─ Profil Perusahaan (edit data, bukan status verifikasi — itu read-only)
```

---

## 2. Pemetaan ke Database — Wajib Dibaca Sebelum Menulis Kode Apa Pun

Semua ini sudah ada di `database/01_schema.sql`. **Jangan bikin tabel atau
aturan baru yang menduplikasi ini** — pakai yang sudah ada.

| Aksi UI | Tabel/Fungsi/View yang dipakai | Catatan penting |
|---|---|---|
| Submit form registrasi | `daftar_perusahaan(nama_kontak, email, password_hash, nama_perusahaan, bidang, dokumen_url)` | Fungsi ini **sudah** membuat baris di `users` (role=perusahaan) DAN `perusahaan` (status_verifikasi='menunggu') sekaligus. Jangan insert manual ke 2 tabel terpisah — panggil fungsi ini saja. |
| Login | `login_lookup(email)` | Mengembalikan `password_hash`, `status`, `role`. Password_hash **tidak bisa** di-SELECT langsung dari tabel `users` (sengaja ditutup RLS) — ini satu-satunya jalan resmi. |
| Cek status verifikasi setelah login | `SELECT status_verifikasi FROM perusahaan WHERE user_id = app_uid()` | RLS (`perusahaan_select`) sudah mengizinkan perusahaan baca baris miliknya sendiri. |
| Jelajahi katalog | `SELECT * FROM v_katalog_publik` | View ini **sudah** menyaring hanya karya approved & menyembunyikan kolom sensitif (email, NIS siswa). Jangan query tabel `karya` mentah untuk fitur ini. |
| Bookmark karya | Tabel `bookmark` (`perusahaan_id`, `karya_id`) | RLS `bookmark_own` — otomatis terbatas ke milik sendiri. |
| Ajukan minat via BKK | INSERT ke `permintaan_kontak` (`karya_id`, `tujuan`, `pesan`) | Trigger `permintaan_guard` **otomatis**: (1) menolak insert kalau `status_verifikasi` perusahaan bukan `disetujui`, (2) menolak kalau karya bukan approved, (3) memaksa `status` awal = `terkirim`. Agent tidak perlu menulis validasi ini manual di server action — tapi **tetap perlu menangani pesan error-nya di UI** kalau trigger menolak. |
| Lihat riwayat permintaan | `SELECT * FROM permintaan_kontak WHERE perusahaan_id = app_uid()` | RLS `pk_select` sudah membatasi otomatis. |
| Lihat notifikasi | `SELECT * FROM notifikasi WHERE user_id = app_uid() ORDER BY created_at DESC` | Baris notifikasi **sudah dibuat otomatis** oleh trigger `notify_permintaan` saat status berubah — agent tidak perlu insert manual. |
| Edit profil perusahaan (nama, bidang, dokumen) | UPDATE `perusahaan` | Trigger `perusahaan_guard` mengunci kolom `status_verifikasi`/`verified_by`/`verified_at` dari sisi perusahaan — field itu read-only di form edit profil, jangan dibuat bisa diubah dari UI perusahaan. |

**Yang paling penting dipahami agent:** hampir semua aturan bisnis (siapa
boleh apa, kapan status berubah) **sudah ditegakkan di level database**
lewat trigger & RLS. Tugas agent di Next.js adalah **memanggil fungsi/query
yang benar dan menampilkan hasil/error-nya**, bukan menulis ulang logika
validasi itu di server action. Kalau ada validasi yang terasa perlu
ditulis ulang di Next.js, itu tanda ada yang salah pemetaan — cek dulu ke
skema sebelum menambah logika baru.

---

## 3. Penyesuaian UI dengan Web Utama (Konsistensi Desain)

Jangan desain ulang dari nol — semua pola di bawah **sudah ada**, tinggal
dipakai ulang:

| Kebutuhan di alur Mitra | Pola yang sudah ada, dipakai ulang |
|---|---|
| Navbar saat sudah login sebagai perusahaan | `Navbar.tsx` yang sudah ada, tambah varian: item menu jadi "Jelajahi Katalog / Talenta Tersimpan / Riwayat Permintaan / Profil Perusahaan", avatar+nama perusahaan di kanan (pola `company-chip` sempat disinggung di eksplorasi awal desain) menggantikan tombol "Login" |
| Grid jelajahi katalog | Pola `GallerySection.tsx` (card thumbnail+badge+jurusan+judul) — tambahkan 1 tombol "Ajukan Minat via BKK" per card, style tombol ikuti `btn-primary` yang sudah didefinisikan |
| Badge status permintaan (terkirim/ditinjau/dst) | Pakai token warna semantic yang **sudah ditetapkan** di `design.md`/skema warna: `info` (biru) untuk "Terkirim", `pending` (kuning) untuk "Ditinjau"/"Klarifikasi", `success` (hijau) untuk "Diteruskan", `error` (merah) untuk "Ditolak" — lihat tabel §5 di bawah |
| Ilustrasi blueprint (leader-line) | Komponen `DimensionLine` dari `updateLanding.md` — dipakai lagi kalau halaman "Pelajari Cara Kerja BKK" butuh elemen visual serupa |
| Tipografi, heading hierarchy, ukuran teks minimum | **Wajib ikuti `design-rules.md` tanpa kecuali** — ini bagian yang paling sering dilanggar di halaman-halaman baru sebelumnya, jangan diulang di halaman Mitra |
| Animasi/transisi | Ikuti `design.md` — jangan tambah animasi baru di luar yang sudah dispesifikasi tanpa alasan, dashboard/form perusahaan ini area fungsional, bukan area "wow moment" |

---

## 4. Fase Pengerjaan (1 Fase = 1 Sesi Kerja Agent)

Setiap fase mengasumsikan fase sebelumnya **sudah direview dan diterima**.
Jangan minta agent mengerjakan 2 fase sekaligus dalam 1 prompt — itu yang
bikin hasilnya berat untuk direview dan rawan agent kehilangan konteks.

### Fase 0 — Orientasi (tidak menulis kode)
Minta agent membaca `AGENTS.md`, `design-rules.md`, bagian tabel
`perusahaan` & `permintaan_kontak` di `database/01_schema.sql`, dan
dokumen ini sampai §3. Minta agent **meringkas pemahamannya dalam 5
kalimat** sebelum lanjut — ini cara murah mengecek agent benar paham
sebelum menghabiskan waktu di fase berikutnya.

### Fase 1 — Form Registrasi Perusahaan (halaman publik, tanpa login)
- Baca dulu `route.ts` registrasi siswa yang sudah ada — **tiru pola
  bcrypt-nya persis** (lihat §6 poin 3)
- 1 halaman: field nama kontak, email, password, nama perusahaan, bidang,
  dokumen legalitas (**isi `dokumen_url` dengan string placeholder/dummy**,
  jangan bangun upload file sungguhan — lihat §6 poin 2)
- Hash password dengan bcrypt di server action, baru panggil
  `daftar_perusahaan(...)` dengan hash yang sudah jadi (fungsi SQL
  menerima `password_hash`, bukan plaintext)
- Setelah sukses, tampilkan state "Akun terdaftar, menunggu verifikasi
  Koordinator BKK" — **jangan** langsung arahkan ke dashboard
- **Scope ketat:** hanya halaman ini. Jangan sekalian bikin login/dashboard
  di fase yang sama.

### Fase 2 — Login & Penjagaan Akses (route guard)
- Baca dulu `authOptions` NextAuth yang sudah ada — tambahkan role
  `perusahaan` ke callback/provider yang sudah berjalan, **jangan** bikin
  konfigurasi NextAuth kedua atau sistem session terpisah
- Credentials provider memanggil `login_lookup(email)`, cocokkan dengan
  bcrypt `compare` (bukan hash ulang)
- Middleware/guard: kalau role=perusahaan dan `status_verifikasi` bukan
  `disetujui` → arahkan ke halaman status (bukan dashboard), tampilkan
  pesan sesuai status (`menunggu` / `ditolak`)

### Fase 3 — Shell Dashboard Perusahaan
- Navbar varian login (lihat §3), 4 menu kosong dulu (placeholder "Segera
  hadir" di tiap halaman)
- Tujuan fase ini **cuma kerangka navigasi**, bukan fitur — supaya struktur
  routing selesai duluan sebelum isi konten per halaman

### Fase 4 — Jelajahi Katalog (sisi Perusahaan)
- Ambil data dari `v_katalog_publik`
- Reuse pola `GallerySection`, tambah tombol "Ajukan Minat via BKK" +
  tombol bookmark di tiap card
- Tombol bookmark langsung fungsional (insert/delete ke tabel `bookmark`)
- Tombol "Ajukan Minat" di fase ini **cukup buka modal kosong dulu** —
  logika submit-nya dikerjakan di Fase 5

### Fase 5 — Form Ajukan Minat + Halaman Riwayat Permintaan
- Modal dari Fase 4 diisi: pilih tujuan (magang/kerja/kolaborasi), pesan
- Submit → insert `permintaan_kontak`, tangani pesan error dari trigger
  (lihat §2) dengan jelas ke pengguna — misalnya kalau ternyata status
  verifikasi belum `disetujui`, tampilkan pesan yang jelas, bukan error
  generik
- Halaman Riwayat Permintaan: list semua permintaan milik sendiri +
  badge status berwarna (lihat §5)

### Fase 6 — Notifikasi
- Baca tabel `notifikasi`, tampilkan badge jumlah belum dibaca di navbar
- Halaman/dropdown daftar notifikasi, tandai dibaca saat diklik

### Fase 7 — Halaman "Pelajari Cara Kerja BKK" (publik)
- Konten edukatif menjelaskan alur §1 dengan bahasa untuk calon mitra
  (bukan bahasa teknis seperti dokumen ini)
- Ini juga tempat yang tepat untuk FAQ ringkas yang pernah direkomendasikan
  di `updateLanding.md` §5 (siapa yang bisa daftar, berapa lama verifikasi,
  berbayar atau tidak)



### Fase 8 — Halaman Profil Perusahaan
- Form edit nama/bidang/dokumen
- Tampilkan status verifikasi sebagai **read-only** (badge, bukan field
  yang bisa diedit)

---

## 5. Pemetaan Status ke Tampilan

| `status` di DB | Label UI (Bahasa Indonesia, untuk pengguna) | Token warna |
|---|---|---|
| `terkirim` | "Terkirim, menunggu ditinjau" | `info` |
| `ditinjau` | "Sedang ditinjau BKK" | `pending` |
| `klarifikasi` | "Perlu klarifikasi dari Anda" | `pending` (beda label dari `ditinjau`, warna sama — status ini perlu aksi pengguna) |
| `diteruskan` | "Diteruskan ke siswa" | `success` |
| `ditolak` | "Tidak dapat diproses" | `error` |

Untuk status `klarifikasi`, tampilkan juga isi `catatan_bkk` di halaman
Riwayat Permintaan — kolom ini wajib diisi BKK untuk status ini dan
`ditolak` (sudah dipaksa oleh constraint `pk_note_chk` di skema), jadi
selalu ada isinya untuk ditampilkan.

---

## 6. Keputusan Teknis (Sudah Dikonfirmasi)

Tiga pertanyaan di versi dokumen sebelumnya sudah dijawab berdasarkan kode
yang **sudah ada** di repo asli (bukan di scaffold contoh yang dibuat di
sesi ini):

1. **Autentikasi: tetap NextAuth.js v4.** Sudah terpasang dengan
   `authOptions` yang sudah ada dan dipakai alur login siswa. **Jangan
   ganti ke solusi lain** — tambahkan role `perusahaan` ke flow NextAuth
   yang sudah berjalan, jangan bikin sistem auth paralel. Agent perlu
   **membaca dulu file `authOptions` yang sudah ada** di repo sebelum
   Fase 2, supaya tahu bentuk `session`/`callbacks` yang harus diikuti.
2. **Dokumen legalitas (`dokumen_url`): mock dulu.** Untuk scope
   kompetisi, field ini diisi string dummy/placeholder saat submit form
   di Fase 1. Upload file sungguhan (Supabase Storage/Cloudinary/lainnya)
   ditunda ke iterasi setelah kompetisi — **jangan kerjakan integrasi
   storage di fase manapun di dokumen ini** kecuali diminta ulang.
3. **Hashing password: bcrypt di server action**, mengikuti pola yang
   sudah dipakai di alur registrasi siswa (`route.ts` yang sudah ada).
   **Agent wajib membaca file itu dulu dan meniru pola yang sama persis**
   untuk registrasi perusahaan di Fase 1 — jangan menulis pendekatan
   hashing baru yang berbeda gaya dari yang sudah ada, supaya 2 alur
   registrasi (siswa & perusahaan) tetap konsisten satu sama lain.

**Instruksi tambahan untuk Fase 0 (revisi):** sebelum membaca dokumen
proyek yang disebut di Fase 0 sebelumnya, agent juga harus **mencari dan
membaca** file `authOptions` NextAuth dan route registrasi siswa yang
sudah ada di repo — dua file itu jadi referensi pola wajib untuk Fase 1
dan Fase 2 di bawah, bukan dibangun dari nol.

---

## 7. Checklist Sebelum 1 Fase Dianggap Selesai

- [ ] Jalankan checklist `design-rules.md` §8 di setiap halaman baru
- [ ] Next.js **tidak** konek ke database pakai role superuser — pastikan
      lewat role `kandaga_app` yang sudah dibuat di skema
- [ ] Uji dengan minimal 2 akun: perusahaan status `menunggu` (harus
      terblokir dari dashboard) dan status `disetujui` (harus bisa akses
      penuh)
- [ ] Error dari trigger database (mis. coba ajukan minat sebelum
      diverifikasi) ditangani jadi pesan yang jelas di UI, bukan error
      mentah ditampilkan ke pengguna
