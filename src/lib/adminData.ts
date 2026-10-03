export interface SystemAuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  detail: string
  status: "SUCCESS" | "FAILED" | "PENDING"
}

export type ProjectDocumentType = "pdf" | "image" | "link" | "video"

export interface ProjectDocument {
  id: string
  name: string
  type: ProjectDocumentType
  /** Path/URL berkas. `null` berarti siswa belum melampirkan berkas tersebut. */
  url: string | null
  meta?: string
  /** Berkas wajib yang harus tersedia sebelum karya diverifikasi admin. */
  required?: boolean
}

export interface ProjectShowcase {
  id: string
  title: string
  category: string
  image: string
  author: string
  authorRole: string
  likes: number
  description: string
  uploadOrder?: number
  uploadedAt?: string
  /** Berkas & tautan pendukung karya yang dapat dibuka admin pada panel kurasi. */
  documents?: ProjectDocument[]
}

export interface MentorItem {
  name: string
  role: string
  initial: string
}

export const systemAuditLogs: SystemAuditLog[] = [
  {
    id: "log-1",
    timestamp: "02 Okt 2026, 15:20 WIB",
    user: "admin.kandaga",
    action: "ROLE_ASSIGNMENT",
    detail: "Menetapkan peran BKK kepada pengguna bkk.smkn13",
    status: "SUCCESS",
  },
  {
    id: "log-2",
    timestamp: "02 Okt 2026, 14:45 WIB",
    user: "guru.pembimbing",
    action: "CURATION_APPROVAL",
    detail: "Menyetujui proyek 'EduClass — LMS & Presensi QR' ke Galeri Utama",
    status: "SUCCESS",
  },
  {
    id: "log-3",
    timestamp: "02 Okt 2026, 11:10 WIB",
    user: "pt.mitra-industri",
    action: "INTERNSHIP_POSTED",
    detail: "Membuka lowongan magang PKL 'Junior Frontend Engineer'",
    status: "SUCCESS",
  },
  {
    id: "log-4",
    timestamp: "01 Okt 2026, 21:05 WIB",
    user: "siswa.smkn13",
    action: "PROJECT_SUBMISSION",
    detail: "Mengunggah proyek tugas akhir baru ke antrean kurasi",
    status: "SUCCESS",
  },
]

/**
 * Menyusun daftar berkas pendukung kurasi sebuah karya.
 * Hanya berkas inti yang ditampilkan: laporan akhir & dokumentasi teknis,
 * surat pernyataan orisinalitas, dan dokumentasi foto kegiatan.
 */
function buildDocuments(projectId: string, previewImage: string): ProjectDocument[] {
  const base: Omit<ProjectDocument, "id">[] = [
    {
      name: "Laporan Akhir & Dokumentasi Teknis",
      type: "pdf",
      url: "/docs/laporan-akhir.pdf",
      meta: "PDF · 2.4 MB",
      required: true,
    },
    {
      name: "Surat Pernyataan Orisinalitas",
      type: "pdf",
      url: "/docs/surat-orisinalitas.pdf",
      meta: "PDF · 620 KB",
      required: true,
    },
    {
      name: "Dokumentasi Foto & Kegiatan",
      type: "image",
      url: previewImage,
      meta: "JPG · 1.2 MB",
    },
  ]

  return base.map((doc, index) => ({
    ...doc,
    id: `${projectId}-doc-${index + 1}`,
  }))
}

export const projectShowcases: ProjectShowcase[] = [
  {
    id: "proj-1",
    title: "EduClass — Platform Presensi QR & LMS",
    category: "RPL",
    image: "/images/preview-rpl.jpg",
    author: "Bayu Salto",
    authorRole: "Siswa RPL",
    likes: 42,
    description: "Sistem presensi digital berbasis QR dinamis dengan modul LMS dan rekapitulasi kehadiran otomatis siswa.",
    uploadOrder: 1,
    uploadedAt: "28 Sep 2026",
    documents: buildDocuments("proj-1", "/images/preview-rpl.jpg"),
  },
  {
    id: "proj-2",
    title: "SmartMonitoring — IoT Sensor Kimia Terpadu",
    category: "TKJ",
    image: "/images/preview-iot.jpg",
    author: "Leonardo Samsul",
    authorRole: "Siswa TKJ",
    likes: 38,
    description: "Sensor IoT pemantau suhu, pH, dan kelembapan secara real-time dengan dashboard telemetri nirkabel terpadu.",
    uploadOrder: 2,
    uploadedAt: "29 Sep 2026",
    documents: buildDocuments("proj-2", "/images/preview-iot.jpg"),
  },
  {
    id: "proj-3",
    title: "AquaPure — Pengujian Baku Mutu Air Industri",
    category: "Analis Kimia",
    image: "/images/preview-kimia.jpg",
    author: "Padhang Satrio",
    authorRole: "Siswa Analisis Kimia",
    likes: 56,
    description: "Analisis parameter kualitas air limbah industri berbasis spektrofotometri sesuai standar pengujian ISO 17025.",
    uploadOrder: 3,
    uploadedAt: "29 Sep 2026",
    documents: buildDocuments("proj-3", "/images/preview-kimia.jpg"),
  },
  {
    id: "proj-4",
    title: "NetGuard — Firewall & Traffic Monitor Sekolah",
    category: "TKJ",
    image: "/images/hero-tkj.jpg",
    author: "Fajar Pratama",
    authorRole: "Siswa TKJ",
    likes: 29,
    description: "Arsitektur keamanan jaringan lokal sekolah dengan rule traffic limiter dan filter konten berbahaya otomatis.",
    uploadOrder: 4,
    uploadedAt: "30 Sep 2026",
    documents: buildDocuments("proj-4", "/images/hero-tkj.jpg"),
  },
  {
    id: "proj-5",
    title: "BioKandaga — Ekstraksi Minyak Atsiri Lokal",
    category: "Analis Kimia",
    image: "/images/hero-kimia.jpg",
    author: "Nabila Azzahra",
    authorRole: "Siswa Analisis Kimia",
    likes: 47,
    description: "Metode distilasi uap fraksinasi tanaman serai wangi guna menghasilkan minyak atsiri bernilai ekonomis tinggi.",
    uploadOrder: 5,
    uploadedAt: "01 Okt 2026",
    documents: buildDocuments("proj-5", "/images/hero-kimia.jpg"),
  },
  {
    id: "proj-6",
    title: "KandagaMart — Point of Sale & Inventory Multi-Cabang",
    category: "RPL",
    image: "/images/hero-kolaborasi.jpg",
    author: "Rian Hidayat",
    authorRole: "Siswa RPL",
    likes: 64,
    description: "Aplikasi kasir web responsif terintegrasi laporan stok barang dan sinkronisasi offline-first PWA.",
    uploadOrder: 6,
    uploadedAt: "01 Okt 2026",
    documents: buildDocuments("proj-6", "/images/hero-kolaborasi.jpg"),
  },
  {
    id: "proj-7",
    title: "CloudLab — Virtual Private Server untuk Praktikum",
    category: "TKJ",
    image: "/images/preview-iot.jpg",
    author: "Dimas Wicaksono",
    authorRole: "Siswa TKJ",
    likes: 31,
    description: "Cluster containerization berbasis Proxmox untuk penyediaan lab virtual siswa secara on-demand.",
    uploadOrder: 7,
    uploadedAt: "02 Okt 2026",
    documents: buildDocuments("proj-7", "/images/preview-iot.jpg"),
  },
  {
    id: "proj-8",
    title: "ChemSpectra — Kolorimetri Digital Sampel Tanah",
    category: "Analis Kimia",
    image: "/images/preview-kimia.jpg",
    author: "Siti Rahmawati",
    authorRole: "Siswa Analisis Kimia",
    likes: 51,
    description: "Pengukuran kandungan hara NPK tanah pertanian menggunakan sensor spektrum warna terkalibrasi.",
    uploadOrder: 8,
    uploadedAt: "02 Okt 2026",
    documents: buildDocuments("proj-8", "/images/preview-kimia.jpg"),
  },
  {
    id: "proj-9",
    title: "AgriTech — Kontrol Irigasi Hidroponik Cerdas",
    category: "RPL",
    image: "/images/preview-rpl.jpg",
    author: "Alif Kurniawan",
    authorRole: "Siswa RPL",
    likes: 43,
    description: "Aplikasi dashboard dan kontroler mikrokontroler untuk automasi penjadwalan nutrisi nutrisi hidroponik.",
    uploadOrder: 9,
    uploadedAt: "02 Okt 2026",
    documents: buildDocuments("proj-9", "/images/preview-rpl.jpg"),
  },
]

/** Uraian lengkap proyek untuk peninjauan admin pada panel kurasi. */
export interface ProjectDetail {
  /** Kalimat positioning singkat tentang proyek. */
  tagline: string
  /** Gambaran umum & latar belakang, satu paragraf per entri. */
  overview: string[]
  /** Tujuan dan sasaran yang ingin dicapai. */
  objectives: string[]
  /** Cakupan pekerjaan: apa saja isi proyeknya. */
  scope: string[]
  /** Fitur unggulan & nilai guna bagi pengguna. */
  highlights: string[]
  /** Teknologi, peralatan, atau metode yang dipakai. */
  stack: string[]
}

export const projectDetails: Record<string, ProjectDetail> = {
  "proj-1": {
    tagline:
      "Platform web yang menyatukan presensi kelas berbasis QR dinamis dengan modul pembelajaran (LMS) dalam satu dasbor sekolah.",
    overview: [
      "EduClass dikembangkan sebagai pengganti pencatatan kehadiran manual yang memakan waktu di awal jam pelajaran dan rentan terhadap titip absen. Setiap siswa memegang kode QR unik yang berotasi mengikuti sesi kelas, sehingga kode tidak dapat dibagikan kepada siswa lain.",
      "Di luar presensi, platform ini menyatukan materi ajar, tugas, dan rekapitulasi kehadiran dalam satu tempat, sehingga guru, wali kelas, dan bagian kesiswaan dapat memantau partisipasi siswa tanpa berpindah aplikasi.",
    ],
    objectives: [
      "Memangkas waktu presensi per rombongan belajar menjadi di bawah satu menit.",
      "Menyediakan rekapitulasi kehadiran otomatis untuk wali kelas dan bagian kesiswaan.",
      "Menjadi kanal tunggal materi, tugas, dan pengumuman kelas.",
    ],
    scope: [
      "Aplikasi web responsif untuk peran siswa, guru, dan admin.",
      "Generator serta rotasi QR dinamis per sesi mata pelajaran.",
      "Modul LMS: materi, tugas, pengumpulan, dan penilaian.",
      "Rekapitulasi kehadiran harian, mingguan, dan per mata pelajaran.",
      "Notifikasi keterlambatan serta ketidakhadiran ke wali kelas.",
    ],
    highlights: [
      "QR berotasi waktu menutup celah titip absen.",
      "Rekap kehadiran tersaji otomatis tanpa rekap manual.",
      "Ringan dijalankan pada perangkat sekolah berspesifikasi rendah.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
  },
  "proj-2": {
    tagline:
      "Perangkat IoT pemantau parameter larutan (suhu, pH, dan kelembapan) secara berkelanjutan dengan dasbor telemetri nirkabel.",
    overview: [
      "Alat ini membaca suhu, pH, dan kelembapan larutan melalui sensor terkalibrasi, lalu mengirimkan data ke dasbor secara berkala. Pengamatan laboratorium tidak lagi bergantung pada pencatatan manual per jam.",
      "Ambang batas aman dapat diatur untuk tiap jenis larutan. Sistem mengirim peringatan otomatis ketika nilai pembacaan keluar dari rentang yang ditentukan, sehingga risiko kerusakan sampel dapat dicegah lebih awal.",
    ],
    objectives: [
      "Memantau perubahan parameter larutan tanpa pengamatan manual terus-menerus.",
      "Memberi peringatan dini ketika kondisi keluar dari ambang batas aman.",
      "Menyimpan riwayat pengukuran sebagai bukti dan bahan analisis praktikum.",
    ],
    scope: [
      "Unit sensor suhu, pH, dan kelembapan dengan mikrokontroler.",
      "Gateway nirkabel dan pengiriman data berkala ke server.",
      "Dasbor telemetri berbasis web untuk pemantauan langsung.",
      "Pengaturan ambang batas dan notifikasi peringatan.",
      "Penyimpanan serta ekspor riwayat pengukuran.",
    ],
    highlights: [
      "Pemantauan otomatis 24 jam tanpa kehadiran operator.",
      "Peringatan dini saat parameter keluar dari ambang batas.",
      "Riwayat data siap diekspor untuk laporan praktikum.",
    ],
    stack: ["ESP32", "Sensor pH & suhu", "MQTT", "Node.js", "PostgreSQL"],
  },
  "proj-3": {
    tagline:
      "Prosedur pengujian kualitas air limbah industri berbasis spektrofotometri yang mengikuti kaidah pengujian laboratorium ISO 17025.",
    overview: [
      "AquaPure menyusun metode pengujian baku mutu air limbah untuk parameter kekeruhan, pH, dan kandungan logam terlarut, dengan tahapan preparasi sampel yang terdokumentasi dan dapat direproduksi.",
      "Hasil pengujian dibandingkan dengan baku mutu yang berlaku, lalu dirangkum menjadi laporan yang siap dipakai mitra industri sebagai dasar evaluasi proses pengolahan limbah.",
    ],
    objectives: [
      "Menyusun prosedur pengujian air limbah yang terdokumentasi dan dapat direproduksi.",
      "Menghasilkan data pengukuran tervalidasi melalui kalibrasi dan pengulangan uji.",
      "Menyajikan laporan hasil uji yang mudah dibaca mitra industri.",
    ],
    scope: [
      "Preparasi sampel dan pengendalian mutu pengujian.",
      "Pengukuran parameter fisik dan kimia (kekeruhan, pH, logam terlarut).",
      "Pembuatan kurva kalibrasi instrumen dan verifikasi hasil.",
      "Perbandingan hasil uji terhadap baku mutu yang berlaku.",
      "Penyusunan laporan hasil uji laboratorium.",
    ],
    highlights: [
      "Prosedur terdokumentasi mengikuti kaidah laboratorium terakreditasi.",
      "Data pengukuran tervalidasi kalibrasi dan pengulangan uji.",
      "Laporan siap dipakai sebagai dasar evaluasi mitra industri.",
    ],
    stack: ["Spektrofotometri UV-Vis", "pH meter terkalibrasi", "Metode gravimetri", "Lembar kerja mutu ISO 17025"],
  },
  "proj-4": {
    tagline:
      "Arsitektur keamanan jaringan sekolah dengan firewall terkelola dan pemantauan lalu lintas data secara terpusat.",
    overview: [
      "NetGuard merancang ulang skema jaringan lokal sekolah dengan memisahkan segmen (VLAN) antara jaringan siswa, guru, dan perangkat laboratorium, serta menerapkan aturan pembatasan lalu lintas pada titik keluar internet.",
      "Seluruh lalu lintas dipantau secara terpusat, sehingga penyalahgunaan bandwidth dan upaya akses ke konten berbahaya dapat terdeteksi dan ditindaklanjuti lebih cepat.",
    ],
    objectives: [
      "Memisahkan segmen jaringan agar gangguan satu segmen tidak menjalar ke seluruh sekolah.",
      "Membatasi dan memantau penggunaan bandwidth per segmen.",
      "Mendeteksi serta memblokir akses ke konten berbahaya.",
    ],
    scope: [
      "Perancangan topologi jaringan dan pemisahan VLAN.",
      "Penerapan aturan firewall dan pembatasan bandwidth.",
      "Filter konten berbahaya beserta pencatatan akses.",
      "Dasbor pemantauan lalu lintas dan notifikasi anomali.",
      "Dokumentasi konfigurasi serta prosedur pemulihan.",
    ],
    highlights: [
      "Segmentasi jaringan menahan penyebaran gangguan antar-segmen.",
      "Pemblokiran otomatis terhadap konten berbahaya.",
      "Pemantauan lalu lintas dan anomali dalam satu dasbor.",
    ],
    stack: ["pfSense", "VLAN & manajemen switch", "RADIUS", "Linux server", "SNMP monitoring"],
  },
  "proj-5": {
    tagline:
      "Metode distilasi uap untuk mengekstraksi minyak atsiri dari serai wangi lokal dengan rendemen dan mutu yang terukur.",
    overview: [
      "BioKandaga meneliti kondisi operasi optimum distilasi uap — suhu, rasio bahan terhadap pelarut, dan waktu proses — untuk memperoleh rendemen minyak atsiri serai wangi yang setinggi mungkin.",
      "Produk yang dihasilkan diuji mutunya melalui pengukuran indeks bias dan uji organoleptik, sehingga kelayakannya sebagai bahan baku kosmetik dan aromaterapi dapat dinilai secara objektif.",
    ],
    objectives: [
      "Menemukan kondisi operasi optimum untuk rendemen minyak atsiri tertinggi.",
      "Menjaga mutu produk melalui pengujian fisik dan organoleptik.",
      "Memanfaatkan bahan baku lokal menjadi produk bernilai tambah.",
    ],
    scope: [
      "Penyiapan bahan baku dan perlakuan awal serai wangi.",
      "Proses distilasi uap dengan variasi kondisi operasi.",
      "Pengukuran rendemen, indeks bias, dan sifat organoleptik.",
      "Evaluasi mutu produk terhadap standar pasar.",
      "Analisis peluang pemanfaatan hasil oleh mitra industri.",
    ],
    highlights: [
      "Rendemen meningkat melalui optimasi kondisi distilasi.",
      "Mutu produk diverifikasi melalui pengujian fisik dan organoleptik.",
      "Berpotensi dikembangkan sebagai produk unggulan sekolah.",
    ],
    stack: ["Distilasi uap", "Refraktometer & piknometer", "Uji organoleptik", "Analisis rendemen"],
  },
  "proj-6": {
    tagline:
      "Aplikasi kasir web dan manajemen stok yang tersinkronisasi antar cabang, serta tetap dapat dipakai ketika koneksi internet terputus.",
    overview: [
      "KandagaMart dirancang untuk unit usaha sekolah dengan beberapa titik penjualan. Transaksi kasir dan perubahan stok tercatat pada satu basis data, sehingga laporan penjualan antar cabang dapat dibandingkan secara langsung.",
      "Aplikasi menerapkan pendekatan offline-first: transaksi tetap berjalan saat koneksi terputus, lalu disinkronkan otomatis begitu jaringan kembali tersedia.",
    ],
    objectives: [
      "Menyatukan pencatatan penjualan dan stok dari seluruh cabang.",
      "Menyediakan laporan penjualan dan stok yang siap dibaca pengelola.",
      "Menjaga operasional kasir tetap berjalan saat koneksi terputus.",
    ],
    scope: [
      "Modul kasir (POS) dengan pencarian cepat dan cetak struk.",
      "Manajemen stok, harga, dan kategori barang.",
      "Sinkronisasi offline-first antar cabang.",
      "Laporan penjualan, stok minimum, dan riwayat transaksi.",
      "Manajemen peran pengguna (pemilik, kasir, staf gudang).",
    ],
    highlights: [
      "Tetap melayani transaksi meski jaringan terputus.",
      "Stok tersinkron antar cabang tanpa rekap manual.",
      "Laporan penjualan per cabang tersaji otomatis.",
    ],
    stack: ["Next.js", "TypeScript", "IndexedDB (PWA)", "PostgreSQL", "Prisma"],
  },
  "proj-7": {
    tagline:
      "Klaster virtualisasi yang menyediakan laboratorium komputer virtual untuk praktikum siswa secara mandiri dan terjadwal.",
    overview: [
      "CloudLab membangun klaster virtualisasi berbasis Proxmox pada perangkat server sekolah, sehingga setiap siswa dapat memperoleh mesin praktikum sendiri tanpa harus menunggu jadwal laboratorium fisik.",
      "Penyediaan dan pengembalian mesin praktikum dilakukan otomatis melalui templat, lengkap dengan pembatasan kuota agar sumber daya server tetap terbagi merata.",
    ],
    objectives: [
      "Menyediakan lingkungan praktikum virtual secara cepat dan terjadwal.",
      "Mengoptimalkan pemakaian perangkat server sekolah yang sudah tersedia.",
      "Memudahkan pengajar menyiapkan dan mengembalikan lingkungan praktikum.",
    ],
    scope: [
      "Pemasangan klaster virtualisasi dan penyimpanan terpusat.",
      "Templat mesin praktikum siap pakai per mata pelajaran.",
      "Pengelolaan akun, kuota, dan penjadwalan akses siswa.",
      "Pemantauan beban CPU, memori, dan penyimpanan.",
      "Prosedur pencadangan serta pemulihan mesin virtual.",
    ],
    highlights: [
      "Setiap siswa memperoleh mesin praktikum sendiri tanpa menunggu lab fisik.",
      "Lingkungan praktikum disiapkan dari templat dalam hitungan menit.",
      "Pemakaian sumber daya server terpantau dan terbagi merata.",
    ],
    stack: ["Proxmox VE", "Linux server", "ZFS storage", "Jaringan VLAN", "Monitoring Grafana"],
  },
  "proj-8": {
    tagline:
      "Pengukuran kandungan hara NPK tanah berbasis analisis warna digital, sebagai alternatif uji laboratorium yang cepat dan terjangkau.",
    overview: [
      "ChemSpectra memanfaatkan reaksi warna antara sampel tanah dan reagen, kemudian intensitas warna dibaca secara digital dan dikonversi menjadi perkiraan kandungan unsur hara NPK.",
      "Metode ini ditujukan untuk pemeriksaan awal di lapangan, sehingga petani memperoleh indikasi kondisi tanah tanpa harus menunggu antrean pengujian laboratorium.",
    ],
    objectives: [
      "Menyediakan metode pemeriksaan awal kandungan hara tanah yang cepat dan terjangkau.",
      "Menjaga akurasi hasil melalui kalibrasi terhadap larutan standar.",
      "Menyajikan rekomendasi pemupukan awal berdasarkan hasil pengukuran.",
    ],
    scope: [
      "Penyiapan sampel tanah dan penambahan reagen pembentuk warna.",
      "Pengambilan citra warna dan pembacaan intensitas secara digital.",
      "Kalibrasi terhadap larutan standar NPK.",
      "Konversi data warna menjadi perkiraan kandungan hara.",
      "Penyusunan rekomendasi awal kebutuhan pemupukan.",
    ],
    highlights: [
      "Hasil pembacaan cepat tanpa menunggu antrean laboratorium.",
      "Kalibrasi larutan standar menjaga konsistensi hasil.",
      "Hasil pengukuran langsung dikaitkan dengan rekomendasi pemupukan.",
    ],
    stack: ["Kolorimetri reagen", "Sensor citra warna digital", "Larutan standar NPK", "Pengolahan data kalibrasi"],
  },
  "proj-9": {
    tagline:
      "Dasbor dan kontroler otomatis untuk penjadwalan irigasi serta pemberian nutrisi hidroponik berbasis pembacaan sensor.",
    overview: [
      "AgriTech menggabungkan kontroler mikrokontroler dengan aplikasi dasbor untuk mengatur jadwal pemberian nutrisi dan air pada instalasi hidroponik, menggantikan penjadwalan manual yang rentan terlewat.",
      "Nilai sensor — kadar nutrisi, volume air, dan suhu larutan — dipantau terus-menerus. Dasbor menampilkan status instalasi sekaligus mencatat riwayat pemberian nutrisi.",
    ],
    objectives: [
      "Mengotomatiskan penjadwalan irigasi dan pemberian nutrisi.",
      "Menjaga parameter larutan tetap pada rentang yang dianjurkan tanaman.",
      "Menyediakan riwayat perawatan sebagai dasar evaluasi hasil panen.",
    ],
    scope: [
      "Kontroler pompa dan katup berbasis mikrokontroler.",
      "Pembacaan sensor kadar nutrisi, volume air, dan suhu larutan.",
      "Aplikasi dasbor pemantauan dan pengaturan jadwal.",
      "Pencatatan riwayat serta notifikasi kondisi abnormal.",
      "Mode manual sebagai cadangan saat jaringan bermasalah.",
    ],
    highlights: [
      "Jadwal irigasi dan nutrisi berjalan otomatis tanpa pengawasan harian.",
      "Kondisi larutan terpantau dan tercatat dari waktu ke waktu.",
      "Mode manual menjaga instalasi tetap berjalan saat jaringan bermasalah.",
    ],
    stack: ["ESP32", "Sensor TDS & water level", "Relay & pompa", "Next.js", "MQTT"],
  },
}

/** Profil lengkap seorang kreator karya (untuk peninjauan admin). */
export interface CreatorProfile {
  name: string
  role: string
  className: string
  major: string
  nis: string
  email: string
  advisor: string
  joinedAt: string
  verifiedWorks: number
}

/** Profil tiap siswa yang tercatat sebagai kreator karya. */
export const creatorProfiles: Record<string, CreatorProfile> = {
  "cr-bayu-salto": {
    name: "Bayu Salto",
    role: "Siswa RPL",
    className: "XII RPL 2",
    major: "Rekayasa Perangkat Lunak",
    nis: "2213045",
    email: "bayu.salto@smkn13bandung.sch.id",
    advisor: "Zakir Horizontal, S.Kom.",
    joinedAt: "Juli 2023",
    verifiedWorks: 3,
  },
  "cr-anisa-rahma": {
    name: "Anisa Rahma",
    role: "Siswa RPL",
    className: "XII RPL 1",
    major: "Rekayasa Perangkat Lunak",
    nis: "2213018",
    email: "anisa.rahma@smkn13bandung.sch.id",
    advisor: "Zakir Horizontal, S.Kom.",
    joinedAt: "Juli 2023",
    verifiedWorks: 2,
  },
  "cr-rian-hidayat": {
    name: "Rian Hidayat",
    role: "Siswa RPL",
    className: "XII RPL 1",
    major: "Rekayasa Perangkat Lunak",
    nis: "2213057",
    email: "rian.hidayat@smkn13bandung.sch.id",
    advisor: "Zakir Horizontal, S.Kom.",
    joinedAt: "Juli 2023",
    verifiedWorks: 6,
  },
  "cr-alif-kurniawan": {
    name: "Alif Kurniawan",
    role: "Siswa RPL",
    className: "XII RPL 2",
    major: "Rekayasa Perangkat Lunak",
    nis: "2213064",
    email: "alif.kurniawan@smkn13bandung.sch.id",
    advisor: "Zakir Horizontal, S.Kom.",
    joinedAt: "Juli 2023",
    verifiedWorks: 5,
  },
  "cr-leonardo-samsul": {
    name: "Leonardo Samsul",
    role: "Siswa TKJ",
    className: "XII TKJ 1",
    major: "Teknik Komputer & Jaringan",
    nis: "2214012",
    email: "leonardo.samsul@smkn13bandung.sch.id",
    advisor: "Hendra Wijaya, S.T.",
    joinedAt: "Juli 2023",
    verifiedWorks: 4,
  },
  "cr-dimas-wicaksono": {
    name: "Dimas Wicaksono",
    role: "Siswa TKJ",
    className: "XII TKJ 1",
    major: "Teknik Komputer & Jaringan",
    nis: "2214023",
    email: "dimas.wicaksono@smkn13bandung.sch.id",
    advisor: "Hendra Wijaya, S.T.",
    joinedAt: "Juli 2023",
    verifiedWorks: 3,
  },
  "cr-fajar-pratama": {
    name: "Fajar Pratama",
    role: "Siswa TKJ",
    className: "XII TKJ 2",
    major: "Teknik Komputer & Jaringan",
    nis: "2214019",
    email: "fajar.pratama@smkn13bandung.sch.id",
    advisor: "Hendra Wijaya, S.T.",
    joinedAt: "Juli 2023",
    verifiedWorks: 2,
  },
  "cr-padhang-satrio": {
    name: "Padhang Satrio",
    role: "Siswa Analis Kimia",
    className: "XII AK 1",
    major: "Analis Kimia",
    nis: "2215008",
    email: "padhang.satrio@smkn13bandung.sch.id",
    advisor: "Dra. Ratna Kusuma, M.Si.",
    joinedAt: "Juli 2023",
    verifiedWorks: 5,
  },
  "cr-siti-rahmawati": {
    name: "Siti Rahmawati",
    role: "Siswa Analisis Kimia",
    className: "XII AK 1",
    major: "Analis Kimia",
    nis: "2215031",
    email: "siti.rahmawati@smkn13bandung.sch.id",
    advisor: "Dra. Ratna Kusuma, M.Si.",
    joinedAt: "Juli 2023",
    verifiedWorks: 4,
  },
  "cr-nabila-azzahra": {
    name: "Nabila Azzahra",
    role: "Siswa Analisis Kimia",
    className: "XII AK 2",
    major: "Analis Kimia",
    nis: "2215017",
    email: "nabila.azzahra@smkn13bandung.sch.id",
    advisor: "Dra. Ratna Kusuma, M.Si.",
    joinedAt: "Juli 2023",
    verifiedWorks: 4,
  },
  "cr-dewi-sartika": {
    name: "Dewi Sartika",
    role: "Siswa Analisis Kimia",
    className: "XII AK 2",
    major: "Analis Kimia",
    nis: "2215024",
    email: "dewi.sartika@smkn13bandung.sch.id",
    advisor: "Dra. Ratna Kusuma, M.Si.",
    joinedAt: "Juli 2023",
    verifiedWorks: 3,
  },
}

/**
 * Daftar id kreator tiap karya, urut sesuai kontribusi.
 * Satu karya dapat dikerjakan beberapa siswa sekaligus, termasuk lintas jurusan,
 * sehingga jumlahnya tidak dibatasi.
 */
export const projectCreatorIds: Record<string, string[]> = {
  "proj-1": ["cr-bayu-salto", "cr-anisa-rahma"],
  "proj-2": ["cr-leonardo-samsul", "cr-nabila-azzahra", "cr-dimas-wicaksono"],
  "proj-3": ["cr-padhang-satrio", "cr-siti-rahmawati", "cr-dewi-sartika"],
  "proj-4": ["cr-fajar-pratama"],
  "proj-5": ["cr-nabila-azzahra", "cr-bayu-salto"],
  "proj-6": ["cr-rian-hidayat", "cr-alif-kurniawan", "cr-leonardo-samsul"],
  "proj-7": ["cr-dimas-wicaksono"],
  "proj-8": ["cr-siti-rahmawati", "cr-padhang-satrio"],
  "proj-9": ["cr-alif-kurniawan", "cr-fajar-pratama"],
}

export const mentorsList: MentorItem[] = [
  { name: "Padhang Satrio", role: "Guru Pembimbing", initial: "PS" },
  { name: "Zakir Horizontal", role: "Koordinator BKK", initial: "ZH" },
  { name: "Leonardo Samsul", role: "Admin Infrastruktur", initial: "LS" },
]

export interface RecentIndustryPartner {
  id: string
  name: string
  field: string
  initial: string
  badge: string
  quotaSiswa: number
  targetJurusan: string[]
  positions: string[]
  mouDate: string
  contactPerson: string
}

export const recentIndustryPartners: RecentIndustryPartner[] = [
  {
    id: "ind-1",
    name: "PT Telkom Indonesia (Digital Service)",
    field: "Telekomunikasi & Software Cloud",
    initial: "TL",
    badge: "MoU Baru",
    quotaSiswa: 6,
    targetJurusan: ["RPL", "TKJ"],
    positions: ["Frontend Engineer", "Cloud Infrastructure"],
    mouDate: "MoU aktif 2 hari lalu",
    contactPerson: "Bpk. Hendra Gunawan",
  },
  {
    id: "ind-2",
    name: "PT Kimia Farma Industri Tbk",
    field: "Farmasi & Riset Kimia Terapan",
    initial: "KF",
    badge: "MoU Baru",
    quotaSiswa: 4,
    targetJurusan: ["Analis Kimia"],
    positions: ["QC Lab Analyst", "Sampling Baku Mutu"],
    mouDate: "MoU aktif 4 hari lalu",
    contactPerson: "Ibu Ratna Dewi",
  },
  {
    id: "ind-3",
    name: "BukaStudio Software House",
    field: "Web & Mobile App Development",
    initial: "BS",
    badge: "Kerja Sama Aktif",
    quotaSiswa: 3,
    targetJurusan: ["RPL"],
    positions: ["React Developer", "UI/UX Designer"],
    mouDate: "MoU aktif minggu ini",
    contactPerson: "Bpk. Aris Munandar",
  },
]
