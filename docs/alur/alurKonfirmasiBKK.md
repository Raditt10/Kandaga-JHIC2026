# alurKonfirmasiBKK.md — Alur Konfirmasi Akun Perusahaan (Sisi Koordinator BKK)

> Pasangan dari `alurMitra.md` (sisi perusahaan). Dokumen ini fokus ke sisi
> **Koordinator BKK**: meninjau pengajuan akun perusahaan yang masuk dari
> Fase 1 `alurMitra.md`, lalu menyetujui atau menolaknya.
>
> Baca `AGENTS.md` dan `alurMitra.md` dulu sebelum ini — dokumen ini
> mengasumsikan Fase 1 (`alurMitra.md`) sudah ada, karena tanpa itu tidak
> ada data yang bisa ditinjau di sini.
>
> **Cara pakai:** sama seperti `alurMitra.md` — beri 1 Fase dari §5 per
> sesi kerja agent, jangan digabung.

---

## 0. Temuan Penting: 2 Celah di Skema Awal (Sudah Ditambal)

Saat menyusun alur ini, ketemu 2 hal yang ada di pola tabel lain
(`karya`, `permintaan_kontak`) tapi terlewat di tabel `perusahaan`:

1. **Tidak ada kolom catatan penolakan.** `karya` punya `catatan_review`,
   `permintaan_kontak` punya `catatan_bkk` — tapi `perusahaan` tidak punya
   tempat menyimpan alasan BKK menolak sebuah pengajuan akun.
2. **Tidak ada notifikasi otomatis ke perusahaan** saat statusnya berubah
   — trigger `notify_karya_review` dan `notify_permintaan` sudah ada
   untuk 2 tabel lain, tapi tidak ada padanannya untuk `perusahaan`.

**Sudah dibuat migrasinya:** `database/02_verifikasi_perusahaan.sql` —
menambah kolom `catatan_verifikasi`, constraint (penolakan wajib disertai
catatan, meniru pola `karya_reject_note_chk`), dan trigger
`notify_perusahaan_verifikasi`. **Sudah diuji langsung** di PostgreSQL
lokal: percobaan tolak tanpa catatan ditolak database dengan benar, dan
percobaan setuju berhasil mengisi `verified_by`/`verified_at` serta
membuat baris notifikasi otomatis.

**Jalankan migrasi ini dulu** (setelah `01_schema.sql`) sebelum mulai
Fase apa pun di §5.

---

## 1. Alur End-to-End (Sisi BKK)

```
[Perusahaan daftar] (alurMitra.md Fase 1)
      ↓
[Masuk antrian BKK] status_verifikasi = 'menunggu'
      ↓
[Koordinator BKK login] → Dashboard BKK → lihat jumlah pengajuan menunggu
      ↓
[Buka Antrian Verifikasi] → list diurutkan FIFO (paling lama menunggu di atas)
      ↓
[Buka Detail Pengajuan] → lihat nama kontak, nama perusahaan, bidang,
                           dokumen (lihat catatan §3 soal dokumen mock),
                           tanggal daftar
      ↓
   ┌──────────────────────┴──────────────────────┐
   ↓                                              ↓
[Setujui]                                    [Tolak + wajib isi catatan]
   ↓                                              ↓
status_verifikasi = 'disetujui'              status_verifikasi = 'ditolak'
verified_by/verified_at terisi otomatis      catatan_verifikasi wajib terisi
   ↓                                              ↓
Notifikasi otomatis ke perusahaan ("akun disetujui, bisa akses katalog")
                    atau ("ditolak, alasan: ...")
      ↓
[Perusahaan login] → lihat status sesuai alurMitra.md Fase 2
      ↓
Masuk juga ke "Manajemen Mitra" (riwayat semua keputusan, bukan cuma antrian)


```

---

## 2. Pemetaan ke Database

| Aksi UI (BKK) | Query/Tabel | Catatan |
|---|---|---|
| Lihat jumlah pengajuan menunggu (widget dashboard) | `SELECT count(*) FROM perusahaan WHERE status_verifikasi = 'menunggu'` | RLS `perusahaan_select` sudah mengizinkan role `koordinator_bkk` baca semua baris `perusahaan`. |
| Lihat antrian (list) | `SELECT p.*, u.nama AS nama_kontak, u.email, u.created_at FROM perusahaan p JOIN users u ON u.id = p.user_id WHERE p.status_verifikasi = 'menunggu' ORDER BY u.created_at ASC` | Urutkan FIFO (`ASC`) — pengajuan yang menunggu paling lama ditangani duluan, bukan yang terbaru. Ini soal keadilan proses, bukan preferensi teknis semata. |
| Lihat detail 1 pengajuan | Query yang sama, `WHERE p.user_id = $1` | — |
| Setujui | `UPDATE perusahaan SET status_verifikasi = 'disetujui' WHERE user_id = $1` | Trigger `perusahaan_guard` **otomatis** mengisi `verified_by = app_uid()` dan `verified_at = now()` — **jangan** diisi manual dari aplikasi, itu sudah pekerjaan trigger. Trigger `notify_perusahaan_verifikasi` otomatis membuat notifikasi. |
| Tolak | `UPDATE perusahaan SET status_verifikasi = 'ditolak', catatan_verifikasi = $2 WHERE user_id = $1` | `$2` **wajib diisi** dari form (lihat §4) — kalau kosong, database akan menolak lewat `perusahaan_catatan_ditolak_chk`. Tangani error ini di UI dengan pesan jelas, jangan biarkan error mentah tampil. |
| Manajemen Mitra (riwayat semua, bukan cuma antrian) | `SELECT ... FROM perusahaan p JOIN users u ON u.id = p.user_id` tanpa filter status, atau filter opsional (`disetujui`/`ditolak`/`semua`) | Beda dari antrian — ini untuk melihat histori, bukan kerja aktif. |
| Notifikasi ke perusahaan | **Otomatis** via trigger — agent tidak perlu insert manual | Dibuat di migrasi `02_verifikasi_perusahaan.sql`. |

**Yang tidak termasuk di alur ini (jangan dikerjakan di sini):** antrian
`permintaan_kontak` (minat kontak dari perusahaan ke siswa) itu alur
**terpisah**, sudah dipetakan di `alurMitra.md` §2 dan punya mesin status
sendiri (`terkirim`→`ditinjau`→dst). Jangan digabung — konfirmasi akun dan
konfirmasi minat kontak adalah 2 antrian berbeda di Dashboard BKK, dikerjakan
sebagai fitur terpisah (lihat batas scope di §5 Fase 5).

---

## 3. Soal Dokumen Legalitas (Ingat Keputusan di `alurMitra.md`)

`dokumen_url` saat ini **diisi string mock/dummy** (keputusan di
`alurMitra.md` §6 — upload file sungguhan ditunda pasca-kompetisi).
Konsekuensinya untuk halaman Detail Pengajuan di sini: tombol "Lihat
Dokumen" **tidak bisa** membuka file sungguhan dulu. Tampilkan apa adanya
sesuai kondisi ini — misalnya label kecil "Pratinjau dokumen belum
tersedia (mode demo)" di sebelah tombol, **jangan** pura-pura tombolnya
berfungsi penuh. Ini konsisten dengan prinsip `design-rules.md`: jangan
membangun UI yang menjanjikan sesuatu yang belum benar-benar ada.

---

## 4. Penyesuaian UI dengan Web Utama

| Kebutuhan | Pola yang dipakai ulang |
|---|---|
| Tabel/list antrian | Pola yang sama dengan `v_antrian_review` (guru) — kalau halaman Antrian Approval Karya untuk guru sudah/akan dibangun, pakai struktur komponen tabel yang sama untuk konsistensi, cukup beda kolom |
| Badge status (menunggu/disetujui/ditolak) | Token warna semantic: `pending` (kuning) untuk "menunggu", `success` (hijau) untuk "disetujui", `error` (merah) untuk "ditolak" — sama seperti tabel status di `alurMitra.md` §5 |
| Form tolak dengan catatan wajib | Modal konfirmasi dengan textarea wajib diisi (validasi di client **dan** biarkan database jadi penjaga terakhir — lihat §2) |
| Navbar/shell untuk role `koordinator_bkk` | Varian baru di `Navbar.tsx`: menu "Dashboard BKK / Verifikasi Akun / Antrian Kontak / Manajemen Mitra" — route guard khusus role ini (lihat `AGENTS.md` §5 soal pemisahan role) |
| Tipografi, heading, ukuran teks | Wajib ikuti `design-rules.md` — halaman tabel/antrian ini rawan melanggar aturan "undersized functional text" kalau label status/tanggal dibuat terlalu kecil, perhatikan khusus di sini |

---

## 5. Fase Pengerjaan

### Fase 0 — Orientasi
Baca `AGENTS.md`, `alurMitra.md`, `02_verifikasi_perusahaan.sql`, dan file
pola guard role yang sudah ada di repo (kalau route guard untuk role
`guru`/`admin` sudah ada, ini dipakai ulang untuk `koordinator_bkk` — lihat
juga `authOptions` yang sudah disebut di `alurMitra.md` §6). Ringkas
pemahaman dalam 5 kalimat sebelum lanjut.

### Fase 1 — Jalankan Migrasi + Shell Dashboard BKK
- Jalankan `02_verifikasi_perusahaan.sql`
- Navbar varian `koordinator_bkk` + route guard (hanya role ini yang boleh akses)
- Dashboard: 1 widget angka "X akun menunggu verifikasi" (query count saja,
  belum perlu list) — scope ketat, jangan sekalian bikin halaman antrian

### Fase 2 — Halaman Antrian Verifikasi (list, FIFO)
- Tabel: nama perusahaan, nama kontak, email, bidang, tanggal daftar
- Klik baris → ke halaman detail (boleh masih kosong/placeholder di fase ini)

### Fase 3 — Halaman Detail Pengajuan + Aksi Setujui/Tolak
- Tampilkan semua data pengajuan + catatan soal dokumen mock (§3)
- Tombol "Setujui" → langsung commit (tidak perlu catatan)
- Tombol "Tolak" → buka modal, textarea catatan wajib, baru submit
- Tangani error constraint dari database (catatan kosong) jadi pesan jelas
- Setelah aksi, redirect balik ke Antrian (baris yang baru diputuskan
  otomatis hilang dari antrian karena query difilter `status = 'menunggu'`)

### Fase 4 — Halaman Manajemen Mitra (riwayat, bukan antrian aktif)
- List semua perusahaan + filter status (Semua/Disetujui/Ditolak)
- Ini untuk rujukan historis, beda tujuan dari Fase 2 yang isinya kerja aktif

### Fase 5 — Pembatas Scope (bukan dikerjakan di sini)
- Antrian "Permintaan Kontak" (minat dari perusahaan ke siswa) **bukan**
  bagian dokumen ini — itu alur terpisah dari `alurMitra.md` §2, dikerjakan
  sebagai dokumen/fase tersendiri setelah ini selesai

---

## 6. Pertanyaan Terbuka (Belum Perlu Dijawab Sekarang, Tapi Dicatat)

1. **Pencabutan verifikasi** — kalau perusahaan yang sudah `disetujui`
   ternyata bermasalah di kemudian hari, apakah BKK bisa mencabut status
   (jadi `ditolak` lagi, atau status baru seperti `dicabut`)? Skema saat
   ini belum mendukung alur ini secara eksplisit. **Tidak perlu dikerjakan
   sekarang** — cukup dicatat supaya tidak diasumsikan sudah tertangani.
2. **SLA/pengingat otomatis** — kalau pengajuan menunggu lebih dari N hari,
   apakah perlu reminder ke BKK? Fitur lanjutan, di luar scope kompetisi.

---

## 7. Checklist Sebelum 1 Fase Dianggap Selesai

- [ ] Migrasi `02_verifikasi_perusahaan.sql` sudah jalan tanpa error
- [ ] Coba tolak tanpa catatan → harus gagal dengan pesan jelas di UI
      (bukan error database mentah)
- [ ] Coba setuju → cek baris `notifikasi` otomatis terbuat (lihat §2)
- [ ] Role selain `koordinator_bkk` **tidak bisa** akses halaman-halaman ini
      (uji login sebagai siswa/guru, harus ditolak)
- [ ] Jalankan checklist `design-rules.md` §8 di setiap halaman baru

