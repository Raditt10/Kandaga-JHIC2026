# alurKarya.md — Alur Sistem Karya: Upload Siswa → Kurasi Guru → Tampil di Galeri

> Ini alur **paling inti** dari seluruh Kandaga — semua fitur lain (badge,
> leaderboard, galeri, bahkan minat perusahaan) bergantung pada data yang
> masuk lewat alur ini. Baca `AGENTS.md`, `konsepGaleri.md` dulu — dokumen
> ini menjelaskan bagaimana data **sampai** ke bentuk Vitrine Card yang
> sudah dirancang di sana.

---

## 0. Alur End-to-End

```
[Siswa] Isi form upload karya
      ↓
[Status: pending] — karya BELUM tampil di galeri publik
      ↓
[Guru pembimbing/kurator jurusan] buka Antrian Approval (scope: jurusannya sendiri)
      ↓
   ┌──────────────────┴──────────────────┐
   ↓                                      ↓
[Disetujui]                          [Ditolak + catatan wajib]
status = 'approved'                  status = 'rejected'
published_at terisi otomatis         siswa dapat notifikasi + catatan
      ↓                                      ↓
Tampil di Galeri Publik                [Siswa revisi & kirim ulang]
(v_katalog_publik)                     → balik ke status 'pending'
      ↓
[Terpisah, opsional, kapan saja setelah approved]
Guru beri Badge tier (Terpilih/Unggulan/Juara Lomba)
Koordinator BKK beri Badge "Diminati Industri" (lewat alur lain, bukan di sini)
```

**Poin penting yang sering disalahpahami:** approve/reject itu **gerbang
tayang**, sedangkan badge itu **lapisan apresiasi terpisah** di atasnya.
Karya yang approved **tidak otomatis dapat badge** — lihat data contoh di
`PROJECT_MEMORY.md`/`README.md` awal, beberapa karya sengaja "tanpa
badge" meski sudah tayang. Jangan gabungkan 2 aksi ini jadi 1 tombol.

---

## 1. Form Upload Karya (Sisi Siswa)

| Field | Tipe Input | Wajib? | Catatan |
|---|---|---|---|
| **Judul Karya** | Text, 1 baris | Wajib | Min beberapa karakter, jangan dibiarkan kosong (constraint DB: `length(trim(judul)) > 0`) |
| **Jenis Karya** | Dropdown | Wajib | Dari tabel `jenis_karya`: Produk Fisik / Aplikasi & Software / Laporan Penelitian / Desain |
| **Jurusan** | — | Otomatis | Diambil dari profil siswa yang login, **tidak** dipilih manual (siswa cuma punya 1 jurusan) |
| **Tahun** | Dropdown/number | Wajib | Default tahun berjalan, range valid 2000–2100 (constraint DB) |
| **Deskripsi** | Textarea | Wajib | Ini yang masuk ke pencarian (`search_vector` full-text search di DB) — dorong siswa menulis deskripsi yang jelas, bukan 1 kalimat |
| **Guru Pembimbing** | Dropdown | **Wajib di level UI** (DB sebenarnya izinkan kosong) | Pilihan **difilter otomatis** hanya guru di jurusan yang sama (trigger `karya_pembimbing_check` akan menolak kalau beda jurusan). Direkomendasikan wajib di UI karena "guru pembimbing" selalu jadi bagian identitas karya di Detail Karya — biarkan DB yang permisif, tapi form yang tegas. |
| **Tools/Skill yang Dipakai** | Multi-select/tag input | Opsional, tapi dianjurkan | Dari tabel `tools_skill` (React, Figma, Supabase, dst.) — kalau tool belum ada di daftar, siswa bisa minta ditambahkan (lewat guru/admin, bukan self-service bebas supaya daftar tidak kotor) |
| **Media (Foto/Video)** | Upload multi-file, bisa drag & drop, bisa diurutkan | Wajib minimal 1 | Urutan yang ditentukan siswa **menentukan thumbnail** — media urutan pertama = thumbnail yang tampil di Galeri (lihat §6). Tampilkan preview + handle drag-reorder di form. |

**Yang sengaja TIDAK ada di form** (supaya form tidak dipakai untuk hal di
luar lingkupnya):
- Field pilih badge — badge **bukan** keputusan siswa, itu hak guru/BKK.
- Field status — status selalu dipaksa `pending` saat insert (trigger
  `karya_guard` memaksa ini, bukan form yang menentukan).

### Validasi & Penanganan Error
- Submit memanggil INSERT ke tabel `karya` (+ `karya_media`, `karya_tools`
  dalam 1 transaksi) — kalau trigger `karya_pembimbing_check` menolak
  (guru beda jurusan, hanya bisa terjadi kalau validasi dropdown di UI
  ditembus), tampilkan pesan jelas, bukan error database mentah.
- Setelah submit sukses: tampilkan state "Karya terkirim, menunggu
  tinjauan guru pembimbing" — **jangan** langsung tampilkan sebagai
  "tayang".

---

## 2. Pemetaan ke Database (Upload)

| Aksi | Tabel/Fungsi | Catatan |
|---|---|---|
| Submit form | INSERT `karya` (siswa_id dari sesi, guru_pembimbing_id, jenis_id, judul, deskripsi, tahun) | Trigger `karya_guard` otomatis set `status='pending'`, mengunci field lain yang tidak boleh diisi dari form (`reviewed_by`, `published_at`, dst.) |
| Upload tiap file media | INSERT `karya_media` (karya_id, url, tipe, urutan) | `urutan` unik per karya — pastikan tidak ada 2 media urutan sama (constraint DB) |
| Pilih tools/skill | INSERT `karya_tools` (karya_id, tool_id) untuk tiap tag yang dipilih | Many-to-many, hapus-insert ulang kalau siswa edit |

---

## 3. Sisi Guru: Antrian Approval (Gerbang Tayang)

- Query: `SELECT * FROM v_antrian_review` — view ini **sudah otomatis**
  difilter ke jurusan guru yang login (lewat `app_jurusan()`), tidak perlu
  filter manual di query aplikasi.
- Tampilan per item: semua field dari §1 (judul, deskripsi, jenis, tahun,
  tools, SEMUA media — bukan cuma thumbnail, guru perlu lihat karya utuh
  untuk menilai).
- 2 aksi:
  - **Setujui** → `UPDATE karya SET status='approved' WHERE id=$1` —
    trigger otomatis mengisi `reviewed_by`, `published_at`, dan mengirim
    notifikasi ke siswa (`notify_karya_review`, sudah ada).
  - **Tolak** → `UPDATE karya SET status='rejected', catatan_review=$2
    WHERE id=$1` — **catatan wajib diisi** (constraint
    `karya_reject_note_chk`), tangani error kalau kosong dengan pesan
    jelas di UI.
- Guru **hanya** bisa aksi pada karya yang `status='pending'` — kalau
  karya sudah diputuskan sebelumnya, trigger `karya_guard` menolak
  perubahan ulang (hindari dobel-approve/reject yang membingungkan).

---

## 4. Sisi Guru: Pemberian Badge (Lapisan Kurasi Terpisah)

**Ini halaman/aksi BERBEDA dari Antrian Approval** — jangan digabung jadi
satu alur, supaya "menayangkan karya" dan "mengapresiasi karya" tetap 2
keputusan yang jelas beda bobotnya.

- Guru membuka daftar karya **miliknya jurusan yang sudah approved**
  (bukan yang pending), pilih karya yang layak diberi badge.
- 3 tier yang bisa diberikan guru: Karya Terpilih, Karya Unggulan, Karya
  Juara Lomba — **tidak termasuk** "Diminati Industri" (itu wewenang
  Koordinator BKK lewat alur terpisah, sudah dibahas di dokumen lain).
- INSERT ke `karya_badge` (karya_id, badge_id) — trigger `karya_badge_guard`
  otomatis menolak kalau: karya belum approved, guru di luar jurusan karya
  tersebut, atau guru mencoba kasih tier "industri".
- **Tidak semua karya approved perlu dapat badge.** Ini wajar dan memang
  disengaja — badge menandakan keistimewaan, bukan checklist rutin.

---

## 5. Edit & Kirim Ulang (Sisi Siswa)

- Siswa **hanya bisa edit** karya yang berstatus `pending` atau `rejected`.
- Begitu diedit, status otomatis kembali ke `pending` (trigger `karya_guard`
  memaksa ini) — artinya edit = ajukan ulang, bukan update diam-diam.
- **Karya berstatus `approved` TERKUNCI permanen** dari sisi siswa —
  ini **bukan bug, ini sengaja**: begitu sebuah karya "diverifikasi
  sekolah" dan tayang publik (termasuk mungkin sudah dilihat/di-bookmark
  perusahaan), mengizinkan edit diam-diam akan merusak kredibilitas klaim
  "terverifikasi" yang jadi diferensiator utama Kandaga. Kalau siswa ingin
  memperbarui karya yang sudah approved, itu perlu jadi **karya baru**
  (atau mekanisme "versi baru" yang di luar scope saat ini — catat sebagai
  potensi fitur lanjutan, bukan kebutuhan sekarang).

---

## 6. Tampil di Galeri — Pemetaan Field ke Vitrine Card

Rujukan: `konsepGaleri.md` §2 (anatomi Vitrine Card). Pemetaan persis:

| Field di `v_katalog_publik` | Tampil sebagai |
|---|---|
| `thumbnail_url` (media urutan pertama) | Gambar utama vitrine |
| `badge_tier` (array) | Menentukan medali yang tampil **dan** ukuran tile (lihat `konsepGaleri.md` §3 — industri=besar, juara/unggulan=sedang, terpilih/tanpa badge=standar) |
| `jurusan_kode` + `tahun` | Baris plakat kecil ("RPL · 2026") |
| `judul` | Judul di plakat (Poppins) |
| `siswa_nama` | Nama di bawah judul |
| `view_count` | **Tidak** ditampilkan di Vitrine Card (biar bersih) — dipakai internal untuk sort "Paling Banyak Dilihat" saja |

Hanya karya dengan `status='approved'` **dan** `deleted_at IS NULL` yang
muncul di sini — ini sudah difilter otomatis oleh view, bukan perlu logic
tambahan di aplikasi.

---

## 7. Halaman Detail Karya — Field Lengkap

Beda dari Vitrine Card (ringkas), halaman Detail Karya menampilkan semua:
- Galeri **semua** `karya_media` (bukan cuma thumbnail), urut sesuai `urutan`
- `deskripsi` lengkap
- Semua `tools_skill` terkait (chip list)
- Nama guru pembimbing (join ke `guru`→`users`)
- Semua badge yang diraih (ikon medali + tooltip nama tier)
- Tombol "Unduh sebagai Referensi" (publik) / "Ajukan Minat via BKK"
  (khusus akun perusahaan terverifikasi — lihat `alurPermintaanKontak.md`)
- Related works: karya lain dari siswa yang sama atau jurusan yang sama

---

## 8. Notifikasi Otomatis (Sudah Ada, Tinggal Dikonsumsi Frontend)

Trigger `notify_karya_review` (sudah ada di `01_schema.sql`) otomatis
membuat baris di tabel `notifikasi` untuk siswa setiap kali statusnya
berubah jadi `approved`/`rejected`, termasuk catatan guru kalau ditolak.
Tidak perlu logic notifikasi baru — ini bagian dari pekerjaan Fase 3
`alurPermintaanKontak.md` (dropdown notifikasi) yang sudah direncanakan,
cukup pastikan jenis notifikasi ini ikut tertampil di sana.

---

## 9. Proteksi Karya (Watermark + Metadata) — Belum Ada Implementasinya

Ini bagian dari value proposition awal Kandaga ("watermark otomatis +
pencatatan metadata upload untuk mencegah klaim plagiarisme") yang
**disebut di konsep tapi belum punya rencana teknis**. Yang sudah ada
secara tidak langsung: `created_at` + `siswa_id` di tabel `karya` sudah
berfungsi sebagai metadata pencatatan (siapa unggah, kapan). **Yang belum
ada**: watermark otomatis pada gambar.

**Catatan untuk didiskusikan, bukan dikerjakan langsung:** watermark
butuh image-processing di server saat upload (misal dengan library
`sharp` di Node — menimpa sudut gambar dengan teks/logo kecil sebelum
disimpan). Ini pekerjaan tambahan yang belum masuk fase manapun di
dokumen alur lain. **Putuskan dulu** apakah ini prioritas untuk scope
kompetisi, atau ditunda seperti keputusan "storage dokumen perusahaan"
sebelumnya — kalau ditunda, catat di `PROJECT_MEMORY.md` §12 supaya tidak
terlupa sebagai klaim yang belum benar-benar ada di produk.

---

## 10. Fase Pengerjaan

### Fase 1 — Form Upload Karya (Siswa)
Semua field §1, termasuk reorder drag-and-drop untuk media dan dropdown
guru pembimbing yang ter-filter jurusan. Submit ke DB sesuai §2.

### Fase 2 — Antrian Approval (Guru)
Query `v_antrian_review`, tampilan detail lengkap, 2 aksi (setujui/tolak
dengan catatan wajib).

### Fase 3 — Pemberian Badge (Guru)
Halaman terpisah dari Fase 2, daftar karya approved di jurusannya, aksi
assign badge 3 tier (bukan "industri").

### Fase 4 — Render Vitrine Card dari Data Asli
Sambungkan `VitrineCard` (dari `konsepGaleri.md` Fase 1) ke
`v_katalog_publik` sungguhan, ganti data dummy.

### Fase 5 — Halaman Detail Karya
Semua field §7, termasuk tombol kontak/unduh sesuai role pengunjung.

### Fase 6 — Edit & Kirim Ulang (Siswa)
UI untuk karya `pending`/`rejected` bisa diedit, karya `approved` tampil
read-only dengan penjelasan singkat kenapa terkunci (§5) — supaya siswa
tidak bingung kenapa tombol edit hilang.

---

## 11. Checklist Sebelum 1 Fase Dianggap Selesai

- [ ] Coba tolak karya tanpa catatan → harus gagal (constraint)
- [ ] Coba approve karya dari jurusan lain (sebagai guru) → harus gagal (RLS/trigger)
- [ ] Coba edit karya yang sudah `approved` → harus terkunci, bukan cuma disembunyikan tombolnya di UI (uji langsung API/server action, bukan cuma UI)
- [ ] Urutan media di form upload benar-benar menentukan thumbnail di Galeri
- [ ] Jalankan checklist `design-rules.md` §8 di form upload dan halaman antrian (form panjang seperti ini rawan melanggar heading hierarchy & line-length kalau tidak diperhatikan)
