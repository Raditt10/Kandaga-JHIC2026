    # Kandaga — Spesifikasi Routing CTA & Footer

Dokumen ini melengkapi `design.md` dan `updateLanding.md`. Fokusnya: ke mana tiga elemen navigasi/CTA berikut mengarah, dan apa isi minimalnya.

---

## 1. Hero CTA — "Mulai Jelajahi"

**Tujuan:** `/galeri-karya` (halaman index Galeri Karya — bukan anchor scroll ke GallerySection di landing page)

**Alasan:**
- "Mulai Jelajahi" adalah bahasa ajakan konversi, bukan bahasa preview — user yang klik ini mengharapkan pengalaman penuh, bukan potongan.
- Nav item "Galeri Karya" dan Hero CTA sama-sama menuju aksi "menjelajahi karya", jadi keduanya harus mengarah ke rute yang sama supaya tidak ambigu.
- `/galeri-karya` sudah mencakup filter jurusan/skill/badge dan grid karya lengkap sesuai sitemap Major Gallery.

**Implementasi:**
```
<Link href="/galeri-karya">MULAI JELAJAHI</Link>
```
Tidak perlu query param filter default — user masuk ke tampilan "semua karya, urut terbaru".

---

## 2. "Pelajari cara kerja BKK →" (di halaman/section Mitra Perusahaan)

**Tujuan:** anchor scroll ke section detail di halaman `/mitra-perusahaan` yang sama (bukan halaman baru), karena section "Rekrut talenta yang sudah teruji..." itu sendiri sudah bagian dari halaman `/mitra-perusahaan`.

```
<a href="#cara-kerja-bkk">Pelajari cara kerja BKK →</a>
```

### Isi section `#cara-kerja-bkk` (perluasan dari ringkasan 01/02/03 yang sudah ada di atas)

**Apa itu BKK**
Satu-dua kalimat penjelasan: BKK (Bursa Kerja Khusus) adalah unit resmi sekolah untuk program *link and match* dengan DUDI (Dunia Usaha Dunia Industri) — proses ini diakui sekolah, bukan sekadar fitur marketplace internal Kandaga.

**Alur lengkap (5 langkah, perluasan dari 3 poin ringkas)**
1. Perusahaan mendaftar akun + unggah dokumen legalitas (NIB/NPWP/SK, dsb.)
2. Verifikasi oleh Koordinator BKK — cantumkan estimasi waktu proses (mis. "1×24 jam kerja")
3. Akun terverifikasi bisa browse & filter katalog karya siswa
4. Kirim minat/kontak melalui sistem — tidak ada kontak langsung ke siswa
5. BKK meneruskan minat ke siswa/guru pembimbing terkait → tindak lanjut (interview, PKL, atau rekrutmen)

**FAQ singkat**
- Berapa lama proses verifikasi akun perusahaan?
- Apakah bisa dipakai untuk kebutuhan PKL saja, bukan hanya rekrutmen?
- Siapa yang bisa dihubungi kalau ada kendala? (kontak Koordinator BKK)

**Penutup**
Ulangi tombol "Daftar Sebagai Mitra Industri" di akhir section, supaya alur baca berakhir di sebuah aksi, bukan cuma informasi.

---

## 3. Nav "Kontak" → Footer

Nav item "Kontak" melakukan scroll ke footer (bukan menuju halaman terpisah). Karena itu, footer harus berfungsi sebagai "halaman kontak versi ringkas", dengan isi minimal:

| Blok | Isi |
|---|---|
| Brand | Logo Kandaga + tagline singkat ("Etalase karya siswa SMKN 13 Bandung") |
| Navigasi cepat | Beranda, Jurusan Kami, Tentang Kami, Galeri Karya, Mitra Perusahaan |
| Kontak | Alamat sekolah, No. Telp/WA, email resmi (mis. `kandaga@smkn13bandung.sch.id`), jam layanan BKK |
| Sosial media | IG, TikTok, Threads (Instagram penting karena Prestasi Siswa nantinya sinkron dari IG sekolah) |
| Tautan induk | Link balik ke situs utama SMKN 13 Bandung — Kandaga adalah sub-modul dari Jurusan → Major Gallery di situs sekolah |
| Legal/credit | "Kandaga — program siswa SMKN 13 Bandung" + tahun berjalan; opsional tambahkan kredit "Dibuat oleh siswa RPL" untuk konteks presentasi lomba |

### Catatan implementasi
- Footer sebaiknya jadi satu komponen (`FooterSection.tsx`) yang di-mount di semua halaman (landing, galeri, mitra perusahaan), bukan cuma di landing page — supaya nav "Kontak" konsisten berfungsi di halaman mana pun.
- Kalau footer nanti pakai efek "fill-on-scroll" (sudah masuk keputusan dari review PM sebelumnya), pastikan efek itu tidak mengganggu keterbacaan info kontak — teks kontak sebaiknya di luar area teks besar yang kena efek fill.

---

## Ringkasan cepat

| Elemen | Jenis navigasi | Tujuan |
|---|---|---|
| Hero "Mulai Jelajahi" | Route baru | `/galeri-karya` |
| "Pelajari cara kerja BKK →" | Anchor di halaman yang sama | `#cara-kerja-bkk` di `/mitra-perusahaan` |
| Nav "Kontak" | Anchor di halaman yang sama | `#footer` (komponen global, semua halaman) |
