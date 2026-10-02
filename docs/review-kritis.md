# Review Kritis Kandaga — Sudut Pandang Manajer & Web Developer Senior

> Ditulis dengan standar tinggi, bukan untuk menyenangkan. Semua angka di bawah
> diambil dari pengukuran langsung atas 92 file `.ts/.tsx` (16.972 baris) di
> `src/`, bukan perkiraan. Bagian pertama adalah yang paling tidak nyaman tapi
> paling berguna: bagaimana situs ini **terasa** saat dilihat.

---

## Bagian 1 — Sebagai pengunjung yang paham desain

Saya membuka situs ini tanpa tahu apa-apa soal proyeknya. Ini yang saya rasakan.

### 1.1 "Kok fontnya banyak sekali?" — dan 3 di antaranya tidak dipakai

Situs memuat **6 keluarga font**: Poppins, Inter, Tangerine, Montserrat, Bebas
Neue, dan Geist Mono. Saya hitung pemakaian nyatanya:

| Font | Berat dimuat | Dipakai di komponen |
|---|---|---|
| Inter | 3 | ✅ 54 file |
| Poppins | 5 | ✅ via `font-heading` (141 pemakaian) |
| Montserrat | **7** | ❌ **0 pemakaian** |
| Tangerine | 2 | ❌ **0 pemakaian** |
| Bebas Neue | 1 | ❌ **0 pemakaian** |
| Geist Mono | — | ❌ tidak pernah didefinisikan (lihat §1.2) |

**Montserrat dimuat dalam 7 bobot (300 sampai 900) dan tidak pernah dipakai
satu kali pun.** Tangerine dan Bebas Neue juga nol. Jadi 10 dari 18 berkas font
yang diunduh pengunjung benar-benar sia-sia — mereka menunggu unduhan untuk
sesuatu yang tidak akan pernah muncul di layar.

Yang paling langsung terasa: **tidak ada satu pun font dekoratif yang benar-benar
muncul**, jadi alasan memuatnya pun tidak pernah terbukti. Entah dipakai, atau
dihapus.

> Catatan: proyek menyimpan alasan pemilihan font di dokumen, tapi dokumen tidak
> pernah mengeksekusi dirinya sendiri. Niat "memakai 6 font untuk identitas" tanpa
> implementasi = beban tanpa manfaat.

### 1.2 Bug: 65 tempat memakai `font-mono` yang tidak pernah ada

`globals.css` baris 30 menulis:

```css
--font-mono: var(--font-geist-mono);
```

Tapi `--font-geist-mono` **tidak didefinisikan di mana pun** — `layout.tsx` hanya
mendaftarkan poppins, inter, tangerine, montserrat, dan bebas-neue. Tidak ada
import Geist.

Akibatnya variabel itu tidak valid, dan **65 pemakaian `font-mono`** di seluruh
aplikasi (label "AKSES DASHBOARD", email di tabel BKK, NIS, path dashboard,
kode) **memakai font yang diwarisi dari body — yaitu Inter — bukan monospace**.

Jadi niat desainnya jelas (angka dan data teknis pakai mono), tapi hasilnya nol.
Ini bukan selera, ini cacat.

### 1.3 Tujuh warna marun, bukan satu

Saya menemukan **47 nilai hex berbeda** dipakai langsung (hardcoded) di 308
tempat — padahal sistem tokennya sudah ada (`--color-primary` dst.). Dari jumlah
itu, **14 di antaranya adalah marun yang berbeda-beda** untuk peran yang sama:

```
#8B1A2F (118x)   #891337 (42x)   #a61743 (34x)   #6B1424 (8x)
#701026 (4x)     #72102e (2x)    #76102f (2x)    #92143b (1x)
#90133b (1x)     #b81d4a (2x)    #6b1426 (1x)    #721426 (1x)
#9c153e (2x)     #4E0E20 (2x)
```

Sebagai pengunjung, saya tidak bisa menamai perbedaannya, tapi saya **merasakannya**:
tombol di satu halaman dan tombol di halaman lain warnanya "hampir sama tapi tidak
sama". Ini yang membuat sebuah situs terasa tidak dikendalikan — bukan jelek,
tapi tidak konsisten, dan otak menangkapnya sebagai "kurang meyakinkan".

Lebih parah: `#8B1A2F` dipakai 118 kali sebagai hex mentah, padahal itu **persis
nilai `--color-primary`**. Jadi tokennya ada, tapi dilewati 118 kali. Token yang
tidak dipatuhi lebih buruk daripada tidak punya token, karena ia menciptakan
ilusi konsistensi.

### 1.4 Semuanya membulat — dan itu menghapus hierarki

Hitungan border radius:

```
206x  rounded-full
125x  rounded-xl
111x  rounded-2xl
 50x  rounded-3xl
 24x  rounded-md
 18x  rounded-lg
  4x  rounded-[28px] / rounded-[32px]
```

**534 pemakaian radius, 10 varian berbeda.** Hampir semua elemen membulat:
tombol, kartu, badge, input, ikon, panel, avatar, tooltip, bahkan pembungkus
tabel. Masing-masing terlihat halus sendirian, tapi bersama-sama hasilnya adalah
**tidak ada satu pun sudut tajam di seluruh situs** — dan tanpa sudut tajam,
mata kehilangan jangkar. Semua permukaan terasa "lembut" dengan intensitas yang
sama, jadi tidak ada yang terasa lebih penting dari yang lain.

Kesan yang muncul: ramah, tapi juga **berlendir** dan tanpa tulang. Desain yang
matang biasanya memakai 2–3 tingkat radius saja, dan membiarkan elemen tertentu
benar-benar tajam untuk memberi kontras.

`rounded-full` 206 kali itu angka yang mencurigakan. Badge berbentuk pil itu
wajar; 206 pemakaian berarti pil dipakai untuk hal-hal yang tidak perlu pil.

### 1.5 Tujuh tingkat bayangan, semuanya pelan

```
82x shadow-xs  19x shadow-md  17x shadow-sm  11x shadow-xl  6x shadow-lg  5x shadow-2xs  5x shadow-2xl
```

145 pemakaian bayangan. Masalahnya bukan jumlahnya, tapi **sebarannya**: 101 dari
145 adalah `xs`/`sm`, yaitu bayangan yang hampir tak terlihat. Ditambah marun
gelap yang mendominasi, hampir semua kartu terasa mengambang tipis tanpa alasan.

Efeknya: pengunjung tidak bisa membedakan mana elemen yang "di atas" dan mana
yang "menempel". Hierarki kedalaman hilang.

### 1.6 Ukuran teks terkecil adalah yang paling sering dipakai

```
347x  text-xs     ← 12px, pemakaian TERBANYAK
262x  text-sm
 63x  text-base
 34x  text-2xl / 34x text-3xl
```

Ini temuan yang paling mengganggu, karena `docs/design/design-rules.md` **explisit
melarang teks terlalu kecil sebagai aturan keras**. Kenyataannya `text-xs` (12px)
adalah ukuran paling dominan di seluruh aplikasi — 347 kali, lebih banyak dari
`text-base` (63x) hampir enam kali lipat.

Sebagai pengunjung berusia 30+, saya akan merasa situs ini dibuat untuk dilihat
dari jarak 30 cm. Label seperti "AKSES DASHBOARD", `email@perusahaan.com`, status
"Terkirim, menunggu ditinjau" — semuanya 12px. Di layar laptop itu masih terbaca;
di HP dengan mata sambil berdiri, tidak.

Yang ironis: aturan sudah ditulis dengan benar, tapi dilanggar oleh kode yang
mengaku mengikutinya.

### 1.7 Gradien marun di mana-mana

45 pemakaian gradien (`bg-gradient-to-r` 22x, `-br` 11x, dst.), mayoritas marun
ke marun yang lebih gelap. Efeknya adalah tampilan yang sangat dikenali sebagai
**"template SaaS sekitar 2021"**: tombol gradien, kartu gradien, badge gradien.

Gradien yang dipakai di semua tempat berhenti menjadi aksen dan menjadi tekstur.
Saran keras: pilih 2–3 tempat saja yang benar-benar butuh (misal tombol utama),
sisanya warna solid.

### 1.8 Landing page terasa seperti showreel, bukan produk

`src/app/page.tsx` menyusun **12 section berurutan**, masing-masing dengan
koreografi animasinya sendiri: curtain reveal, jendela melebar, card deck
auto-advance 7 detik, count-up, tilt-on-hover, SVG stroke draw, flowing menu,
tooltip hotspot, accordion.

Sebagai pengunjung, 15 detik pertama terasa mengesankan. Setelah 60 detik, saya
lelah — karena **setiap section meminta perhatian saya, dan tidak ada yang
meminta keputusan saya**. Tidak jelas mana aksi utama: apakah saya di sini untuk
melihat karya, mendaftar sebagai mitra, atau mengagumi transisi.

12 section yang semuanya "wah" sama dengan tidak ada yang "wah". Situs yang
matang biasanya punya satu momen besar (biasanya hero), lalu menurunkan intensitas
secara sengaja supaya bagian penting terasa menonjol.

### 1.9 Empat kelemahan rasa lainnya

- **Bahasa berlapis.** Model database Inggris (`Projects`, `Company`), UI Indonesia, dokumen campur. Kesan: dikerjakan bergantian tanpa kamus bersama.
- **Panel marun kosong.** Di `/auth/login`, kolom kanan 560px berisi marun polos tanpa apa pun. Komentar di kode berbunyi "dikosongkan untuk ditaruh design". Pengunjung tidak tahu itu sengaja; yang terasa adalah desain yang belum selesai.
- **Tidak ada halaman error.** Nol `error.tsx`, nol `not-found.tsx` di seluruh aplikasi. URL salah atau kegagalan server memunculkan layar bawaan Next.js yang menabrak seluruh identitas visual. Ini momen paling tidak profesional yang bisa dialami pengunjung, dan tidak dijaga.
- **Nuansa "AI slop"** yang kamu sebut muncul dari gabungan hal di atas: radius seragam, bayangan tipis seragam, gradien di mana-mana, ikon lucide di setiap header, dan teks 12px yang seragam. Tidak ada satu pun elemen yang berani berbeda.

---

## Bagian 2 — Sebagai manajer teknis

### 2.1 Tech stack: pilihan wajar, eksekusi belum rapi

| Pilihan | Penilaian |
|---|---|
| Next.js 16 App Router | ✅ Tepat untuk kebutuhan (SSR galeri, RBAC, API route satu tempat) |
| PostgreSQL + Prisma | ✅ Tepat, tapi alur migrasinya tidak dipakai (§2.2) |
| Tailwind v4 | ✅ Tepat, tapi tokennya dilewati (§1.3) |
| NextAuth **v4** di Next 16 | ⚠️ Bekerja, tapi di luar jalur dukungan resmi. v5 (Auth.js) masih beta. Ini keputusan yang harus disadari, bukan dibiarkan |
| 3 library animasi (`motion` + `gsap` + `lenis`) | ⚠️ Ketiganya terpakai, tapi 3 sistem animasi berarti 3 cara berbeda melakukan hal yang sama. `gsap` hanya di 2 komponen — tidak cukup alasan untuk membawa satu library penuh |
| `@google/genai` | ✅ Terpakai, dan penanganan fallback offline-nya bagus |
| `@types/pg` + `ts-node` | ❌ Tidak terpakai sama sekali |
| Dua lockfile (npm + pnpm) | ❌ Berbahaya — dua orang bisa dapat pohon dependensi berbeda |

### 2.2 Database: dirancang bagus, dinyatakan bohong

Ini masalah paling serius di proyek, dan tidak terlihat dari UI.

- `database/02_verifikasi_perusahaan.sql` berisi constraint + trigger notifikasi yang **cocok dengan schema Prisma**, tapi **belum pernah dijalankan**. Hasil pemeriksaan langsung: **0 trigger, 0 view, 0 function aplikasi** di database.
- Akibatnya `api/bkk/verifikasi` mengembalikan pesan ke pengguna *"Notifikasi dikirim otomatis"* padahal tabel `notifications` masih 0 baris. **Kode berbohong tentang perilakunya sendiri.**
- `docs/alur/alurMitra.md` §2 memerintahkan pemakaian `v_katalog_publik`, `app_uid()`, dan `permintaan_guard` yang tidak ada. Siapa pun yang mengikuti dokumen itu akan menulis query ke objek yang tidak eksis.
- Tidak ada tabel `_prisma_migrations`. Database dibangun lewat `db push` manual, sehingga perubahan schema tidak pernah memberi peringatan. Ini sudah pernah memakan korban: kolom `companies.catatan_verifikasi` hilang dan **mematikan login seluruh peran** tanpa pesan yang jelas.

### 2.3 Dua sumber kebenaran untuk data yang sama

Aplikasi punya **tiga lapis data** yang saling menutupi:

1. Database Prisma (kosong untuk konten: `projects` 0, `students` 0, `teachers` 0)
2. Data statis `src/data/galleryData.ts` (878 baris) yang jadi fallback galeri
3. Mock in-memory `src/lib/users.ts` yang masih dipakai `admin/dashboard`

Akibatnya: **galeri tampak terisi padahal database kosong.** Untuk lomba, ini bisa
jadi penyelamat; untuk produk, ini mimpi buruk — tidak ada cara mengetahui data
mana yang nyata. Ini juga alasan kenapa mustahil mengukur apakah sistem benar-benar
bekerja: UI tidak pernah gagal, karena selalu ada cadangan palsu.

### 2.4 Tidak ada jaring pengaman

```
error.tsx        : 0 file
not-found.tsx    : 0 file
__tests__        : tidak ada
.github/ (CI)    : tidak ada
```

Nol test. Nol CI. Nol halaman error. Untuk proyek 17 ribu baris yang akan dinilai,
ini risiko terbesar: setiap perubahan hanya diverifikasi dengan mengklik manual.
Satu refactor di file 847 baris bisa mematikan alur tanpa ada yang tahu sampai
demo.

### 2.5 62% aplikasi berjalan di browser

**57 dari 92 file** memakai `"use client"`. Artinya sebagian besar halaman dikirim
sebagai JavaScript dan dirender di perangkat pengunjung, bukan di server. Untuk
situs galeri yang isinya statis dan publik, ini pilihan yang mahal: waktu muat
lebih lama, SEO lebih lemah, dan di HP kelas bawah akan terasa berat.

Penyebabnya struktural: halaman-halaman besar menyatukan data fetching, state,
dan markup dalam satu file `"use client"`.

### 2.6 Halaman monolitik

```
878 baris  data/galleryData.ts
847 baris  app/student/page.tsx
503 baris  app/gallery/[id]/page.tsx
454 baris  app/teacher/page.tsx
445 baris  app/auth/register/page.tsx
421 baris  app/mitra/daftar/page.tsx
```

Enam file di atas 400 baris, dan `app/student/page.tsx` hampir 850 baris dalam
satu file. Tidak ada pemisahan ke hooks, service, atau sub-komponen. Efek
praktisnya: satu orang menyentuh file itu, orang lain tidak bisa bekerja di
file yang sama, dan review jadi tidak mungkin.

---

## Bagian 3 — Foldering

Strukturnya **hampir** bagus, tapi ada beberapa hal yang membuatnya sulit
dinavigasi:

### 3.1 `src/components/` campur dua sistem pengelompokan

```
components/
├── landing/  jurusan/  bkk/  company/  gallery/  chat/   ← dikelompokkan per fitur
├── layout/   ui/                                          ← dikelompokkan per jenis
├── DashboardLayout.tsx                                    ← berdiri sendiri, tidak masuk grup mana pun
```

Dua sistem bercampur dalam satu folder. Akibatnya saat mencari "komponen
dashboard", tidak jelas harus melihat ke `layout/`, `ui/`, atau akar `components/`.
`DashboardLayout.tsx` (338 baris, dipakai lintas peran) seharusnya ada di
`layout/`.

### 3.2 Dua tempat bernama "data"

- `src/data/` → konten statis (`galleryData.ts`, `jurusanData.ts`)
- `src/lib/data.ts` → data teks landing page

Dua hal berbeda dengan konsep sama di dua lokasi berbeda. Siapa pun yang mencari
"data" akan menebak.

### 3.3 `src/lib/` menampung terlalu banyak jenis hal

```
lib/prisma.ts          ← koneksi database
lib/auth.ts            ← aturan redirect & normalisasi role
lib/AuthProvider.tsx   ← React context provider
lib/motion.ts          ← variant animasi
lib/kandaga-knowledge.ts ← isi otak chatbot (basis pengetahuan)
lib/users.ts           ← database mock in-memory
lib/SmoothScrollProvider.tsx
```

Koneksi database, konfigurasi animasi, basis pengetahuan chatbot, dan data mock
bercampur dalam satu folder. `lib/` seharusnya berarti "utilitas murni", bukan
"segala hal yang tidak masuk folder lain".

### 3.4 Logika bisnis menempel di halaman

Halaman `app/*/page.tsx` memuat validasi, pemanggilan API, pengelolaan state, dan
markup sekaligus. Tidak ada lapisan `services/` atau `hooks/`. Akibatnya aturan
seperti "status permintaan ditolak wajib punya catatan" harus diulang di setiap
tempat yang membutuhkannya, bukan didefinisikan sekali.

### 3.5 `app/api/` sudah benar

Satu hal yang patut dipuji: pemisahan API per domain (`api/bkk/`, `api/company/`,
`api/auth/`) rapi dan konsisten. Ini bagian foldering yang paling sehat.

---

## Bagian 4 — Yang sudah benar (dan tidak boleh diubah)

Kritik tanpa apresiasi itu tidak jujur. Ini yang sudah di atas rata-rata:

- **Aksesibilitas serius**: 183 atribut `aria-*`, 36 `alt=`, dan `prefers-reduced-motion` ditangani global di `globals.css`. Banyak proyek komersial tidak melakukan ini.
- **Nol `<img>` mentah** — semua gambar lewat `next/image` (26 file). Optimalisasi gambar konsisten.
- **Nol `eslint-disable`, nol `TODO/FIXME`.** Sangat bersih untuk proyek tim.
- **Otorisasi terpusat** di `proxy.ts` + session guard berpola sama di semua API route. Tidak ada rute yang "lupa dijaga" secara pola.
- **`getDashboardUrl()` dan `normalizeRole()` terpusat** di `lib/auth.ts` — satu tempat untuk semua logika redirect. Ini keputusan yang matang.
- **`design-rules.md` ada dan spesifik** (batas `65ch`, larangan nested card, hierarki heading). Kebanyakan proyek tidak pernah menuliskan ini.
- **Penanganan fallback offline pada chatbot** — fitur tidak mati total saat API key tidak ada.

---

## Bagian 5 — Kalau saya yang memutuskan, urutannya ini

Diurutkan berdasarkan **dampak dibagi usaha**, bukan berdasarkan seberapa sulit.

| # | Tindakan | Alasan | Usaha |
|---|---|---|---|
| 1 | Hapus Montserrat, Tangerine, Bebas Neue dari `layout.tsx` | 10 berkas font terbuang, 3 menit kerja, langsung terasa di kecepatan | 5 menit |
| 2 | Perbaiki `--font-mono` (definisikan Geist Mono, atau ganti ke `ui-monospace`) | 65 tempat salah render | 10 menit |
| 3 | Buat `app/error.tsx` + `app/not-found.tsx` | Satu-satunya momen yang membuat situs terlihat belum jadi | 1 jam |
| 4 | Jalankan `database/02_verifikasi_perusahaan.sql` | Menghapus klaim palsu "notifikasi otomatis" | 30 menit |
| 5 | Putuskan satu package manager, buang lockfile lain | Mencegah bug "jalan di laptopku" | 15 menit |
| 6 | Ganti 347 `text-xs` yang berisi teks fungsional jadi `text-sm` | Aturan desain sendiri dilanggar | 2–3 jam |
| 7 | Konsolidasi 14 marun jadi 3 nilai, dan ganti hex mentah jadi token | Brand jadi konsisten | 3–4 jam |
| 8 | Turunkan radius ke 3 tingkat, hapus ~150 `rounded-full` yang tidak perlu pil | Menghilangkan kesan "AI slop" paling cepat | 3–4 jam |
| 9 | Isi database dengan data nyata, matikan fallback statis | Supaya bisa tahu sistem benar-benar bekerja | 1 hari |
| 10 | Pecah `app/student/page.tsx` (847 baris) + tambah 5 test untuk alur kritis | Menyelamatkan proyek dari kematian saat demo | 2–3 hari |

**Tiga hal yang saya sarankan JANGAN dikerjakan sekarang:** mengganti NextAuth v4
ke v5, menambah library animasi keempat, dan merapikan seluruh `src/lib/`.
Ketiganya berisiko tinggi dengan manfaat yang tidak terlihat pengunjung.

---

## Penutup

Situs ini secara teknis **lebih baik dari yang terlihat**, dan secara visual
**lebih lemah dari yang seharusnya**. Fondasinya benar: RBAC terpusat, aksesibilitas
dijaga, aturan desain ditulis. Yang gagal adalah disiplin pada aturan itu sendiri —
font dimuat tanpa dipakai, token warna dilangkahi, aturan ukuran teks dilanggar,
dan migration yang menjanjikan notifikasi tidak pernah dijalankan.

Kabar baiknya: hampir semua temuan di Bagian 1 (yang paling menentukan kesan
pengunjung) bisa diperbaiki **tanpa menyentuh arsitektur** — hanya dengan
menghapus dan menyeragamkan. Perbaikan itu juga yang paling cepat terasa.
