# Aturan Baku — Mencegah "AI Slop" di Seluruh Situs Kandaga

> Dokumen ini beda dari `updateJurusan.md`/`pm-feedback-review.md` (yang
> mereview halaman yang SUDAH dibangun). Ini adalah **aturan yang berlaku
> SEBELUM dan SELAMA membangun** section/halaman apa pun — supaya masalah
> yang sama tidak terus muncul di tempat baru.

---

## 0. Kenapa Dokumen Ini Perlu Ada Sekarang

Dari 4 screenshot terbaru halaman Jurusan, ada kabar baik dan kabar yang
perlu jadi alarm:

**Yang sudah diperbaiki (bagus, dipertahankan):**
- Keputusan aset 3D **sudah ditunda** sesuai rekomendasi §3.A
  `updateJurusan.md` — placeholder sekarang jujur bilang "keputusan aset
  ditunda sesuai rapat tim", bukan dipaksa jadi fitur yang belum siap.
- Filter jurusan sekarang **sticky dan rapi**, sesuai §3.A.
- Badge "ISO & BNSP" ditambahkan — detail kredibilitas yang bagus.

**Yang jadi alarm:** masalah dari review sebelumnya (font, heading,
ukuran teks, nested card, line length) **muncul lagi persis sama** di
section yang belum pernah direview (Detail Jurusan, Program Unggulan,
section baru "Solusi Utuh"). Ini membuktikan satu hal penting: **memperbaiki
1 halaman setelah jadi tidak cukup** — akar masalahnya ada di *cara* setiap
section baru dikerjakan (kemungkinan besar tiap section dibangun sendiri-
sendiri/copy-paste dari pola yang sama, tanpa ada yang mengecek halaman
secara utuh sebelum dianggap selesai).

Karena itu dokumen ini bukan daftar perbaikan lagi — ini **aturan tetap**
yang harus dicek di SETIAP section baru, di halaman mana pun, sebelum
dianggap selesai.

---

## 1. Aturan Tipografi — Tidak Ada Pengecualian

| Aturan | Detail |
|---|---|
| Heading (`h1`–`h4`) | **Selalu** `font-heading` (Poppins). Tidak ada heading yang boleh memakai font body (Plus Jakarta Sans). |
| Body text, label, deskripsi | `font-sans` (Plus Jakarta Sans). |
| Tanda bahaya | Kalau 1 font tunggal mendominasi **>70% teks yang terlihat** di satu halaman (temuan lama "body font 86% of text" di screenshot), itu tandanya heading tidak memakai token yang benar — audit sebelum halaman dianggap selesai. |

**Kenapa ini terus terjadi:** kemungkinan besar komponen baru dibuat dengan
class Tailwind default (`font-sans`) tanpa sengaja menambahkan
`font-heading` di elemen judul. Ini bukan salah selera, ini kelalaian
implementasi berulang — solusinya teknis, bukan diskusi desain lagi (lihat
§8 untuk cara mencegahnya otomatis).

---

## 2. Aturan Ukuran Teks (Batas Keras, Bukan Saran)

| Jenis teks | Minimum mutlak | Target default |
|---|---|---|
| Body/paragraf utama | 16px (`text-base`) | 16px |
| Teks fungsional/label (badge, chip, metadata seperti "3 Thn") | **12px** — tidak pernah di bawah ini | 13–14px (`text-sm`) |
| Teks apa pun di seluruh situs | **11px adalah batas mati** — di bawah ini tidak pernah dikirim ke production | — |
| Target tap berisi teks (chip, tombol kecil) di mobile | tinggi minimum 36px, idealnya 44px | 44px |

Temuan "10PX FUNCTIONAL TEXT (below 11px floor)" di badge "3 Thn"/"4 Thn"
itu representatif dari kesalahan yang sama diulang di banyak tempat kecil
(nomor urut "01–05" di daftar kompetensi, badge "Produksi Riil", "Terkreditasi",
dst). **Aturan konkret:** setiap kali membuat badge/chip/label kecil baru,
mulai dari `text-sm` (14px) sebagai default, turunkan HANYA sampai `text-xs`
(12px) kalau benar-benar perlu, dan **tidak pernah** di bawah itu.

---

## 3. Aturan Hierarki Heading

1. **1 halaman = 1 `<h1>`.** Tidak lebih, tidak kurang.
2. **Tidak boleh loncat level.** `h2` harus diikuti `h3` sebelum `h4`, bukan
   `h2` → `h4` langsung (persis kesalahan yang terjadi di "Rekayasa Perangkat
   Lunak" (h2) → "Student Software House" (h4), melewati h3).
3. **Tulis outline heading dulu, sebelum ngoding visualnya.** Sebelum bikin
   section baru, tulis di komentar kode urutan headingnya:
   ```
   h1: Tiga Pilar Keahlian...
     h2: Rekayasa Perangkat Lunak
       h3: Kompetensi Utama
       h3: Program Unggulan
         h4: Student Software House
         h4: Hackathon & Inovasi Aplikasi Kandaga
   ```
   Kalau outline ini tidak bisa ditulis rapi tanpa loncat, urutan visualnya
   juga pasti bermasalah — perbaiki outline dulu sebelum lanjut coding.
4. **Ukuran visual dan level semantik itu 2 hal terpisah.** Label kecil
   seperti "PILAR 1: PRESISI ILMIAH" atau angka "01" pada daftar kompetensi
   **bukan** heading — itu `<span>`/`<p>` dengan style kecil, walau posisinya
   di atas judul besar. Jangan pilih tag heading berdasarkan tampilan
   visualnya (besar/kecil/tebal), pilih berdasarkan **posisinya di outline
   struktur konten**.

---

## 4. Aturan Panjang Baris (Line Length)

- Semua paragraf body text: `max-width` dibatasi ke **60–75 karakter**
  (pakai `max-w-[65ch]` di Tailwind), **tidak pernah** dibiarkan meregang
  selebar container di desktop.
- Ini berlaku untuk SEMUA paragraf baru — deskripsi jurusan, deskripsi
  section "Solusi Utuh", deskripsi program unggulan, dst. Ini yang paling
  sering lolos karena default HTML/Tailwind tidak membatasi lebar teks
  secara otomatis — harus ditambahkan manual setiap kali menulis elemen
  paragraf baru.

---

## 5. Aturan All-Caps

- All-caps **hanya** untuk label pendek: maksimal **4–5 kata**, di bawah
  ~30 karakter (contoh yang benar: "GALERI", "TENTANG KARYA", "KEUNGGULAN").
- **Tidak pernah** all-caps untuk kalimat penuh atau judul section
  (kesalahan yang terjadi di "SINERGI INTERDISIPLINER: KANDAGA ECOSYSTEM"
  dan "CONTOH KARYA NYATA KOLABORATIF DI SMKN 13:" — dua-duanya kepanjangan
  untuk all-caps, dan salah satunya bahkan digabung dengan masalah line
  length juga).
- **Konten dinamis tidak pernah di-uppercase secara paksa** — judul karya,
  nama siswa, atau teks apa pun yang nanti diisi dari database/CMS harus
  tetap sentence case seperti aslinya. All-caps hanya untuk label UI statis
  yang kita tulis sendiri, bukan untuk konten yang panjangnya tidak bisa
  diprediksi.

---

## 6. Aturan "Nested Cards" — Ini Akar dari Kesan "AI Slop"

Ini aturan paling penting di dokumen ini, karena polanya paling sering
berulang (Program Unggulan, section "Solusi Utuh" — dua-duanya sama-sama
grid kartu ikon+judul+deskripsi).

1. **Maksimal 1 pola "grid kartu identik" per halaman.** Kalau section
   kedua butuh menampilkan beberapa item sejenis, **wajib pakai pola visual
   yang berbeda** dari section pertama — bukan kartu rounded dengan ikon di
   pojok lagi.
2. **Sebelum membuat section baru, tanya dulu:** "Apakah bentuk ini
   (kartu+ikon+judul+deskripsi dalam grid) sudah dipakai di section lain
   pada halaman yang sama?" Kalau jawabannya ya, **ganti pola**, jangan
   dilanjutkan.
3. **Daftar pola pengganti yang sudah tersedia di sistem kita** (lihat
   `updateJurusan.md` §4 dan §3.C untuk detail implementasi):
   - `AccordionList` — untuk konten padat teks
   - `StickyCardStack` — untuk konten ringkas + visual
   - `CompetencyChipList` (gaya `DimensionLine`) — untuk daftar
     kompetensi/skill pendek
   - Tabel sederhana — untuk data terstruktur (mis. perbandingan tahun/durasi)
4. **Contoh penerapan aturan ini pada temuan terbaru:** section "Program
   Unggulan" (4 kartu) dan section "Solusi Utuh" (3 kartu pilar) **memakai
   pola grid kartu yang identik** di halaman yang sama. Salah satunya wajib
   diubah — misalnya "Solusi Utuh" jadi 3 kolom teks sederhana dengan garis
   pemisah vertikal (tanpa card/border/shadow sama sekali), supaya kedua
   section terasa berbeda saat pengguna scroll dari satu ke yang lain.

---

## 7. Aturan Kontras

- Minimum WCAG AA: **4.5:1** untuk teks biasa, **3:1** untuk teks besar
  (≥24px, atau ≥18.6px bila bold).
- Setiap pasangan warna baru (teks di atas background apa pun) **diuji
  dulu** dengan color contrast checker sebelum dipakai — jangan
  mengandalkan penilaian mata di layar terang studio desain, karena warna
  yang terlihat "cukup kontras" di monitor kalibrasi bisa gagal di HP
  dengan brightness rendah/cahaya matahari.

---

## 8. Checklist Wajib Sebelum Section/Halaman Dianggap Selesai

Jalankan tool anotasi (yang menghasilkan screenshot ini) di **setiap**
halaman baru — bukan cuma saat ada laporan masalah. Halaman baru dianggap
selesai HANYA kalau tidak ada temuan:

- [ ] `OVERUSED FONT`
- [ ] `SKIPPED HEADING LEVEL`
- [ ] `UNDERSIZED FUNCTIONAL TEXT` / `TINY BODY TEXT`
- [ ] `ALL-CAPS BODY TEXT`
- [ ] `LINE LENGTH TOO LONG`
- [ ] `LOW CONTRAST TEXT`
- [ ] `NESTED CARDS` lebih dari 1 instans pola yang sama dalam 1 halaman

Tambahan proses (bukan dari tool, tapi manual):
- [ ] Outline heading ditulis lebih dulu (lihat §3.3) sebelum coding visual
- [ ] Setelah 2+ section selesai, lakukan **1 pass "zoom out"** membaca
      seluruh halaman dari atas ke bawah sekali jalan — bukan cuma
      mengecek section yang baru dikerjakan secara terisolasi. Ini langkah
      yang paling sering dilewat, dan justru ini yang menangkap masalah
      "section A dan section C ternyata kembar" seperti temuan hari ini.

---

## 9. Kenapa Pola Ini Cenderung Berulang (Akar Masalah Proses)

Setiap section yang dibangun terpisah cenderung **konsisten di dalam
dirinya sendiri** (1 section itu sendiri terlihat rapi) tapi **tidak
konsisten dengan halaman secara keseluruhan** — ini ciri khas pengerjaan
yang berjalan section-per-section tanpa jeda melihat gambar besar. Solusi
prosesnya bukan "lebih hati-hati", tapi **menambahkan 1 langkah wajib**:
setelah section ke-2 pada halaman yang sama selesai, berhenti sejenak,
scroll seluruh halaman dari atas, dan tanyakan "apakah ini terasa seperti
1 halaman yang sama, atau seperti beberapa halaman berbeda ditempel jadi
satu?"

---

## 10. Hubungan dengan Dokumen Lain

- `design.md` — spesifikasi motion/animasi (bukan aturan struktural ini)
- `updateLanding.md`, `updateJurusan.md`, `pm-feedback-review.md` —
  penerapan aturan ini pada halaman spesifik yang sudah/sedang dibangun
- **Dokumen ini** — aturan yang berlaku untuk halaman APA PUN yang belum
  dibangun, termasuk yang belum kita rencanakan sama sekali (Leaderboard,
  Detail Karya, Panel Perusahaan, dst.). Baca ini duluan sebelum mulai
  section baru jenis apa pun.
