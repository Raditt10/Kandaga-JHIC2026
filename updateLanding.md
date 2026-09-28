# Update Landing Page — Section "Untuk Industri & Mitra" + Rekomendasi Konten

> Melanjutkan `design.md`. Dokumen ini fokus pada 1 section baru yang
> ditambahkan di landing page, plus audit konten dari sudut pandang
> manajerial/bisnis — bukan cuma visual.

---

## 1. Kenapa Section Ini Perlu Ada

Landing page yang sudah kita bangun (Hero → Galeri → Statistik → Kenapa
Harus Kandaga) itu **100% bicara ke audiens siswa/publik**. Padahal salah
satu pilar inti Kandaga adalah menghubungkan siswa ke industri (DUDI/BKK) —
tapi sejauh ini **tidak ada satupun titik di landing page yang bicara
langsung ke calon perusahaan mitra**. Mereka baru "disapa" kalau sudah masuk
ke Detail Karya. Itu terlambat — perusahaan yang baru dengar nama Kandaga
dari mulut ke mulut atau media, begitu buka landing page, harus langsung
tahu "oh, saya bisa jadi mitra di sini", bukan menemukannya secara tidak
sengaja.

**Penempatan:** setelah section "Kenapa Harus Kandaga?", sebelum Footer.
Logikanya: pengunjung sudah "diyakinkan" dulu soal kualitas karya (3 section
sebelumnya), baru diajak bertindak sebagai mitra — pola *build trust →
call to action* yang standar di halaman B2B manapun.

**Nama section:** "Untuk Industri & Mitra" — bukan "Daftar Akun Perusahaan".
Yang pertama bahasa marketing/ajakan, yang kedua bahasa teknis formulir.
Pengunjung datang untuk dibujuk dulu, formulir pendaftaran ada di halaman
berikutnya setelah klik CTA.

---

## 2. Konsep Visual: "Cetak Biru" (Blueprint), Bukan Literal Penggaris

Ide awal "tema penggaris" aku angkat jadi konsep yang lebih matang:
**estetika gambar teknik/cetak biru (blueprint)** — garis ukur (dimension
line), tanda ukur (tick mark), anotasi seperti gambar kerja teknik, grid
tipis di background.

**Kenapa ini, bukan penggaris literal:** ikon penggaris sungguhan akan
terasa seperti klise alat tulis sekolah dasar — kurang pas untuk institusi
yang mau tampil kredibel di mata perusahaan. Estetika blueprint mengambil
*esensi* dari ide "mengukur" (presisi, akurasi) tapi dibungkus jadi bahasa
visual yang dipakai di dunia teknik profesional — dan ini **menyatukan
ketiga jurusan sekaligus**: Analis Kimia (presisi pengukuran di lab), TKJ/RPL
(skematik/blueprint sistem). Jadi section ini jadi satu-satunya section yang
merepresentasikan seluruh identitas SMK secara visual, bukan cuma nama.

**Elemen visual konkret:**
- Border section pakai garis dimension-line ala gambar teknik (garis tipis
  dengan ujung panah kecil "⊢——⊣"), bukan border polos.
- Grid halus (opacity ~4%) sebagai tekstur latar, bukan solid color flat.
- Setiap poin benefit untuk perusahaan diberi **garis penunjuk** (leader
  line) seperti anotasi pada gambar teknik — bukan ikon card biasa seperti
  section "Kenapa Harus Kandaga".
- Palet tetap konsisten (marun/emas/charcoal), tapi garis blueprint pakai
  warna charcoal tipis di atas background krem/putih — bukan biru literal
  (supaya tidak lepas dari brand Kandaga).

### Ilustrasi kode motif garis ukur (SVG, ringan, dipakai sebagai dekorasi)

```tsx
// Komponen dekoratif kecil — dipakai sebagai pemisah/underline di headline
function DimensionLine({ width = 120 }: { width?: number }) {
  return (
    <svg width={width} height="16" viewBox={`0 0 ${width} 16`} className="text-ink-300">
      <line x1="0" y1="8" x2={width} y2="8" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="2" x2="0" y2="14" stroke="currentColor" strokeWidth="1" />
      <line x1={width} y1="2" x2={width} y2="14" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
```

Dipakai di bawah label kecil ("UNTUK INDUSTRI") sebagai pengganti underline
polos — detail kecil tapi konsisten dengan tema.

---

## 3. Struktur & Copy Section

```
Label kecil: "UNTUK INDUSTRI & MITRA"  [+ DimensionLine di bawahnya]

Headline: "Rekrut talenta yang sudah teruji, bukan tebakan."
Subheadline: "Setiap karya di Kandaga telah melalui kurasi guru pembimbing —
              Anda melihat portofolio nyata, bukan sekadar CV."

3 poin manfaat (dengan leader-line style, bukan card):
  ⊢─ Akses talenta terverifikasi
      Portofolio yang sudah dikurasi, bukan unggahan bebas.
  ⊢─ Filter sesuai kebutuhan
      Cari berdasarkan jurusan, skill, dan jenis karya secara spesifik.
  ⊢─ Proses resmi lewat BKK sekolah
      Setiap kontak difasilitasi dan diverifikasi pihak sekolah.

CTA utama: [ Daftar Sebagai Mitra Industri ]  (tombol marun solid)
CTA sekunder (text link): "Pelajari cara kerja BKK →"

Keterangan kecil di bawah CTA (trust signal, low-key):
"Akun perusahaan diverifikasi oleh Koordinator BKK sebelum dapat mengakses katalog."
```

Catatan penting soal CTA sekunder: ini **wajib** ada. Perusahaan yang belum
yakin daftar langsung butuh jalur "pelajari dulu" tanpa komitmen — mengarah
ke halaman/section FAQ soal BKK (lihat §5 poin 4).

---

## 4. Deskripsi UI (POV Designer Profesional)

Kalau aku deskripsikan section ini sebagai desainer yang mengerjakan brief
ini secara langsung:

**Layout:** dua kolom di desktop (60/40) — kolom kiri berisi headline +
3 poin manfaat dengan leader-line, kolom kanan berisi *visual anchor*: satu
ilustrasi blueprint sederhana (bukan foto orang jabat tangan generik!) —
misal sketsa garis dari "kartu karya" yang diberi anotasi ukur seolah sedang
"diperiksa" oleh perusahaan, dengan tick mark di sudut-sudutnya. Ini
menghindari klise stok foto korporat yang tidak related dengan Kandaga.

**Background:** krem (`--color-cream`) atau neutral-100, **bukan** putih
polos seperti section sebelumnya — supaya ada jeda visual sebelum Footer
gelap, dan grid blueprint lebih terlihat kontras di atas warna hangat ini.

**Tipografi:** headline tetap pakai Poppins seperti section lain, tapi poin
manfaat memakai sedikit karakter monospace tipis (`font-mono`, ukuran kecil,
untuk label "01 / 02 / 03" saja) — meniru notasi ukuran di gambar teknik.
Ini detail halus yang membedakan section ini tanpa merusak konsistensi
brand keseluruhan.

**Responsif:** di mobile, kolom kanan (ilustrasi blueprint) disembunyikan
atau diperkecil jadi elemen dekoratif tipis di atas headline — jangan
dipaksakan tetap dua kolom, karena leader-line butuh ruang horizontal yang
di mobile tidak tersedia.

**Motion (mengacu ke `design.md`):** garis dimension-line di-animasikan
"digambar" (`stroke-dashoffset`) saat section masuk viewport, sekali saja —
selaras dengan prinsip "reveal bermakna" yang sudah kita tetapkan, bukan
cuma fade-in generik.

---

## 5. POV Manajer: Informasi yang Masih Kurang di Landing Page

Ini bagian di luar urusan visual — kalau aku posisikan diri sebagai manajer
produk yang bertanggung jawab atas konversi & kredibilitas platform, ada
beberapa hal yang landing page saat ini **belum** punya, dan berisiko:

1. **Trust bar logo mitra** — baris logo perusahaan yang sudah bekerja sama
   (meski dummy dulu untuk prototipe). Angka "40+ Mitra Industri" di section
   statistik jadi jauh lebih kredibel kalau ada representasi visualnya,
   bukan cuma angka.

2. **Testimoni** — dari 3 sisi: siswa yang karyanya berhasil dilirik
   industri, guru pembimbing, dan (kalau memungkinkan) perusahaan mitra.
   Tanpa ini, klaim "terverifikasi sekolah" dan "terbuka untuk industri"
   masih terasa seperti klaim sepihak dari pembuat situs.

3. **FAQ** — pertanyaan yang pasti muncul di kepala pengunjung tapi tidak
   dijawab di manapun saat ini: *Siapa yang bisa daftar sebagai mitra? Apakah
   berbayar? Berapa lama proses verifikasi? Bagaimana kalau saya siswa dan
   mau tahu cara upload karya?* — FAQ ini juga sekaligus jadi tujuan CTA
   sekunder "Pelajari cara kerja BKK" di section baru ini.

4. **Bukti nyata di balik statistik "3× Penghargaan Nasional"** — angka ini
   powerful tapi tanpa konteks jadi rawan dipertanyakan. Idealnya ada
   section kecil "Pencapaian" yang sebut nama lomba/tahun (meski singkat),
   supaya klaim ini bisa diverifikasi, bukan sekadar nomor besar.

5. **Kontak resmi & jam operasional BKK** — perusahaan yang serius mau
   kontak butuh kepastian channel resmi (bukan cuma tombol "Daftar" yang
   terasa satu arah). Ini bisa masuk footer, tapi harus eksplisit ada,
   bukan diasumsikan pengunjung akan mencarinya sendiri.

6. **Kebijakan Privasi & Syarat Ketentuan** — karena platform ini menyimpan
   data siswa (yang sebagian di bawah umur) dan data perusahaan, ini bukan
   sekadar formalitas hukum tapi **sinyal kepercayaan** yang langsung
   dilihat pihak sekolah/orang tua kalau mereka mengecek situs ini.

**Prioritas kalau waktu kompetisi terbatas:** kerjakan poin 1 (trust bar)
dan 3 (FAQ ringkas, cukup 4-5 pertanyaan) dulu — dua ini paling murah
dikerjakan tapi paling besar dampaknya ke kredibilitas di mata juri yang
menilai dari sisi bisnis, bukan cuma UI.

---

## 6. Urutan Final Landing Page (setelah update ini)

```
Navbar
Hero
Galeri (preview karya)
Statistik ("Lebih dari sekadar tugas")
Kenapa Harus Kandaga
Untuk Industri & Mitra   ← BARU (section ini)
[Rekomendasi lanjutan: Trust bar logo, FAQ — lihat §5]
Footer
```
