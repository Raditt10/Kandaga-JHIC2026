# Sistem Desain Dashboard Kandaga

> Dokumen ini melengkapi `design-rules.md`. Bedanya: `design-rules.md` mengatur
> **halaman publik** (tipografi, hierarki heading, line length, nested card).
> Dokumen ini mengatur **dashboard berperan** — Admin, Siswa, Guru, BKK,
> Perusahaan: token warna, radius, dan pola kartu yang wajib sama.
>
> Aturan tipografi, heading, dan aksesibilitas di `design-rules.md` **tetap
> berlaku** di dalam dashboard.

---

## 1. Sumber Kebenaran

| Sumber | Isinya |
|---|---|
| `docs/AGENTS.md` §3 "Design System (Non-negotiable)" | Token warna mana yang boleh dipakai dan untuk apa |
| `src/app/globals.css` blok `@theme inline` | Nilai token yang sebenarnya berlaku |
| `src/components/dashboard/DashboardShell.tsx` | Satu-satunya chrome dashboard |

Aturan dari `AGENTS.md`: semua warna lewat token, **jangan** tambah
`tailwind.config.js`, dan **jangan** pakai kelas warna literal.

## 2. Token yang Berhak Dipakai

Diambil dari `globals.css` (bukan dari `AGENTS.md`, yang hex-nya sudah
kedaluwarsa — lihat §8):

| Token | Nilai | Pemakaian |
|---|---|---|
| `primary` | `#8B1A2F` | Brand utama, tombol utama, aksen |
| `primary-dark` | `#6B1424` | Hover/pressed, ujung gradien hero |
| `ink` | `#1A1A1A` | Teks utama |
| `ink-700` | `#3D3D3D` | Teks kuat sekunder |
| `ink-600` | `#555555` | Teks sekunder — **batas tergelap untuk teks kecil** |
| `ink-300` | `#CCCCCC` | Ikon/petunjuk yang memang redup, garis tegas |
| `ink-150` | `#E8E8E8` | Garis tepi kartu/input (paling sering dipakai) |
| `ink-100` | `#F2F2F2` | Latar lembut, isian bidang, baris tabel |
| `accent` | `#E8C97A` | **Hanya** medali/badge prestasi |
| `cream` | `#F5F0E8` | Latar section alternatif |

Skala `ink` **tidak lengkap**: hanya ada 100/150/300/600/700/900 (tanpa
50/200/400/500/800/950). Karena itu pemetaan palet harus sadar-legibilitas —
lihat §6.

Warna status (emerald/amber/rose/blue milik Tailwind) dibiarkan apa adanya:
`AGENTS.md` menyebut warna status sebagai hal terpisah dari brand.

---

## 3. Satu Chrome untuk Semua Peran

`DashboardShell` memiliki seluruh tampilan. Yang berbeda antar peran hanya
daftar menunya:

| Berkas | Peran | Isi |
|---|---|---|
| `components/admin/AdminLayout.tsx` | Admin | daftar menu saja |
| `components/bkk/BKKLayout.tsx` | BKK | daftar menu saja |
| `components/company/CompanyLayout.tsx` | Perusahaan | daftar menu saja |
| `components/DashboardLayout.tsx` | Siswa & Guru | daftar menu + navigasi berbasis tab |

`DashboardLayout` dipertahankan karena Siswa dan Guru berpindah tab lewat
state, bukan route.

Peran **tidak** dibedakan lewat warna, melainkan lewat chip ikon
(`roleIcon`/`roleAccent`), label peran, dan judul halaman.

**Jangan membuat chrome baru.** Kalau perlu variasi, tambah prop ke
`DashboardShell`.

---

## 4. Kosakata Visual Baku

### Hero beranda dashboard

Satu-satunya tempat gradien dipakai. **Persis** string ini di kelima peran:

```
rounded-3xl bg-gradient-to-r from-primary-dark to-primary text-white p-7 sm:p-9 relative overflow-hidden shadow-xl shadow-primary/15
```

Label di dalam hero: `inline-block px-3 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider`.
Teks pendukung: `text-rose-100 text-xs sm:text-sm leading-relaxed max-w-[65ch] opacity-90`.

### Kartu statistik

```
p-4 rounded-2xl bg-white border border-ink-150 shadow-xs flex items-center justify-between hover:shadow-md transition
```

Tile ikon `w-10 h-10 rounded-xl`, label `text-[11px] text-ink-600 block font-medium`,
nilai `text-xs font-bold text-ink`.

### Panel / kartu konten

```
bg-white rounded-2xl p-5 border border-ink-150 shadow-xs
```

Judul: `font-heading text-sm sm:text-base font-extrabold text-ink`.
Deskripsi: `text-xs text-ink-600 max-w-[65ch]`.

### Tabel

Header `border-b border-ink-150 text-[10px] text-ink-600 uppercase tracking-wider`;
baris `divide-y divide-ink-100` + `hover:bg-ink-100/60`.

### Pil status & badge

`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`, dengan warna
semantik: terverifikasi → `bg-emerald-50 text-emerald-600`; menunggu →
`bg-amber-50 text-amber-600`; identitas/jurusan → `bg-primary/10 text-primary`.

### Tombol

| Peran | Kelas |
|---|---|
| Utama | `bg-primary hover:bg-primary-dark text-white rounded-full` |
| Di atas gradien | `bg-black/90 hover:bg-black text-white rounded-full` |
| Sekunder | `bg-ink-100 hover:bg-ink-150 text-ink-700 rounded-full` |
| Garis tepi | `border border-ink-150 hover:bg-ink-100 text-ink-600 rounded-full` |

### Bidang isian

```
rounded-xl border border-ink-150 bg-ink-100 placeholder:text-ink-600
focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary
```

### Radius

Kartu/panel `rounded-2xl` · hero `rounded-3xl` · pil `rounded-full` ·
bidang isian & tombol kecil `rounded-xl`.

---

## 5. Yang Sengaja TIDAK Diseragamkan

- **Halaman publik** — `components/landing/*`, `jurusan/*`, `gallery/*`,
  `layout/Navbar.tsx`, `Footer.tsx`, `chat/ChatWidget.tsx`, dan
  `app/gallery/*`, `app/siswa/*`, `app/jurusan/*`. Semuanya mengikuti
  `design-rules.md` dan punya bahasa desainnya sendiri.
- **Warna status** (emerald/amber/rose/blue). Status sistem, bukan brand.
- **`accent` (`#E8C97A`)** hanya untuk medali — jangan untuk tombol umum.

---

## 6. Peta Migrasi

Kalau menemukan sisa gaya lama di cakupan dashboard, pakai pemetaan ini.

### Palet netral → `ink` (sadar-legibilitas)

| Lama | Teks | Latar | Garis |
|---|---|---|---|
| `*-900` / `*-800` / `*-950` | `ink` | `ink` | `ink-700` |
| `*-700` | `ink-700` | `ink-700` | `ink-700` |
| `*-600` / `*-500` | `ink-600` | `ink-700` | `ink-300` |
| `*-400` | `ink-300` | `ink-150` | `ink-300` |
| `*-300` / `*-200` | `ink-300` | `ink-150` | `ink-150` |
| `*-100` / `*-50` | `ink-300` | `ink-100` | `ink-150` |

Aturan penting: **teks sekunder tidak pernah lebih redup dari `ink-600`.**
`ink-300` hanya untuk ikon/petunjuk yang memang berperan redup — jangan untuk
teks yang harus dibaca.

### Hex literal → token

| Lama | Baru |
|---|---|
| `[#891337]`, `[#8B1A2F]`, `[#A61743]`, `[#D6336C]` | `primary` |
| `[#6B1426]`, `[#701026]`, `[#72102E]`, `[#70102D]` | `primary-dark` |
| `[#E8C97A]` | `accent` |

### Radius & hero

- `rounded-3xl` → `rounded-2xl`, **kecuali hero** (tetap `rounded-3xl`).
- Hero tiap dashboard → string kanonik di §4. Gradien hijau BKK, maroon tua
  Perusahaan, rose Siswa, dan amber Guru semuanya diganti gradien token yang
  sama.

---

## 7. Bug yang Ditemukan & Diperbaiki

`globals.css` mendefinisikan `ink-200`? **Tidak.** Tapi kode memakainya.
Karena tokennya tidak ada, Tailwind v4 tidak menghasilkan utility-nya, jadi
kelas seperti `border-ink-200` **tidak menghasilkan CSS sama sekali** — garis
tepi yang ditulis di kode tidak pernah tampil, tanpa error apa pun.

Di cakupan dashboard: **28 kelas** diperbaiki (dipetakan ke shade yang
terdefinisi).

**Masih terbuka — 51 kelas di 6 berkas publik:**

```
src/app/gallery/page.tsx
src/app/gallery/[id]/page.tsx
src/app/siswa/[id]/page.tsx
src/components/gallery/GalleryPagination.tsx
src/components/gallery/GalleryToolbar.tsx
src/components/gallery/ProjectCard.tsx
```

Ini **belum diperbaiki dengan sengaja**: memperbaikinya akan mengubah tampilan
halaman publik (garis tepi yang tadinya tidak tampil akan muncul). Pilihannya
ada dua, dan keduanya keputusan pemilik halaman publik:

1. Petakan ke shade yang terdefinisi (seperti yang dilakukan di dashboard), atau
2. Tambahkan shade yang hilang ke `@theme` di `globals.css` — perbaikan akar
   yang sekaligus memperbaiki seluruh 51 kelas tanpa mengubah satu pun nama
   kelas, tapi memperbesar blast radius ke seluruh situs.

---

## 8. Inkonsistensi Dokumen yang Perlu Diketahui

Tabel token di `docs/AGENTS.md` §3 **tidak cocok** dengan `globals.css`:

| Token | `AGENTS.md` | `globals.css` (berlaku) |
|---|---|---|
| `primary` | `#9E1A3D` | `#8B1A2F` |
| `primary-dark` | `#7A1430` | `#6B1424` |
| `primary-light` | `#F7E3E9` | **tidak ada** |
| `accent` | `#F0C419` | `#E8C97A` |
| `cream` | `#FFF8E7` | `#F5F0E8` |
| `success/pending/error/info` | ada | **tidak ada** |

Yang berlaku adalah `globals.css`. `primary-light` yang tidak ada itulah
sebabnya kode memakai `bg-rose-50` untuk latar chip — tidak ada token
alternatifnya. `AGENTS.md` sebaiknya diselaraskan.

---

## 9. Cara Memverifikasi

```powershell
# 1. Tidak ada palet di luar token di cakupan dashboard
#    (pola: slate-/zinc-/gray-/neutral-/stone- ber-shade)
# 2. Tidak ada hex brand literal
# 3. Tidak ada shade ink di luar 100/150/300/600/700/900
# 4. Hanya 1 varian hero di kelima peran
# 5. typecheck + build
npx tsc --noEmit
npm run build
```

Dashboard di balik middleware auth, jadi `curl` ke `/student`, `/teacher`,
`/bkk`, `/company` membalas **307 → `/auth/login`**. Itu perilaku benar.

---

## 10. Utang Teknis yang Masih Terbuka

1. **`/student/my-projects` (dan `[id]`) masih memakai chrome publik
   (`Navbar`)**, bukan `DashboardShell`. Tokennya sudah seragam, tapi
   browsernya belum — pindah dari dashboard Siswa ke halaman ini masih terasa
   berpindah aplikasi.
2. **"Karya Saya" ada dua implementasi**: tab `karya-saya` di dalam
   `/student/page.tsx` dan halaman `/student/my-projects`. Keduanya perlu
   disatukan.
3. **51 kelas `ink` tak-terdefinisi di halaman publik** — lihat §7.
4. **`docs/AGENTS.md` §3 tidak sinkron dengan `globals.css`** — lihat §8.
