import type { JurusanSlug } from "@/types";

export interface StudentProfileData {
  id: string;
  name: string;
  username: string;
  nis: string;
  class: string;
  major: JurusanSlug;
  majorName: string;
  generation: number;
  avatar: string;
  bio: string;
  currentCareer?: string;
  status: "aktif" | "alumni";
  isPrivate: boolean;
  privacyReason?: string;
  skills: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
    instagram?: string;
  };
  contactEmail?: string;
}

export interface GalleryProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  solutionHighlights: string[];
  major: JurusanSlug;
  majorLabel: string;
  jurusan?: JurusanSlug;
  jurusanLabel?: string;
  year: number;
  coverImage: string;
  galleryImages: string[];
  status: "verified" | "featured";
  badgeTier?: "gold" | "silver" | "bronze";
  badgeLabel?: string;
  tools: string[];
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentClass: string;
  isStudentPrivate: boolean;
  /** Karya privat: hanya pemilik & guru pembimbing yang bisa melihat. */
  isPrivate?: boolean;
  createdAt?: string;
  updatedAt?: string;
  advisor: {
    name: string;
    role: string;
    reviewNotes: string;
  };
  metrics: {
    views: number;
    likes: number;
  };
  links?: {
    demoUrl?: string;
    githubUrl?: string;
    docUrl?: string;
  };
}

export const STUDENT_PROFILES: Record<string, StudentProfileData> = {
  "farhan-maulana": {
    id: "farhan-maulana",
    name: "Farhan Maulana",
    username: "farhanm",
    nis: "222310452",
    class: "XII RPL 1",
    major: "rpl",
    majorName: "Rekayasa Perangkat Lunak",
    generation: 2024,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: "Fullstack web developer muda yang berfokus pada ekosistem Next.js, TypeScript, dan cloud infrastructure. Tertarik pada sistem manajemen pendidikan dan otomasi cerdas.",
    currentCareer: "Software Engineer Intern di CV Inovasi Digital",
    status: "aktif",
    isPrivate: false,
    skills: ["TypeScript", "Next.js", "React", "PostgreSQL", "Prisma", "Tailwind CSS", "Docker"],
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      website: "https://farhan.dev",
    },
    contactEmail: "farhan.maulana@student.smkn13bandung.sch.id",
  },
  "rian-pratama": {
    id: "rian-pratama",
    name: "Rian Pratama",
    username: "rianpratama",
    nis: "222320118",
    class: "XII TKJ 2",
    major: "tkj",
    majorName: "Teknik Komputer Jaringan",
    generation: 2024,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Spesialis otomasi jaringan dan Internet of Things (IoT).",
    currentCareer: "Network Technician Trainee",
    status: "aktif",
    isPrivate: true,
    privacyReason: "Pemilik akun membatasi visibilitas profil pribadi untuk publik sesuai kebijakan privasi siswa SMKN 13 Bandung.",
    skills: ["MikroTik RouterOS", "Cisco CCNA", "ESP32 / Arduino", "Linux Server", "Python"],
  },
  "dewi-sartika": {
    id: "dewi-sartika",
    name: "Dewi Sartika Putri",
    username: "dewisartika",
    nis: "212230089",
    class: "XIII Analis Kimia 1",
    major: "analis-kimia",
    majorName: "Analis Kimia",
    generation: 2023,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    bio: "Peneliti muda di bidang spektrofotometri dan kimia lingkungan terapan.",
    currentCareer: "QC Lab Intern di PT Bio Farma",
    status: "aktif",
    isPrivate: true,
    privacyReason: "Siswa ini memilih mode privasi terproteksi selama masa magang industri PKL.",
    skills: ["Spektrofotometri UV-Vis", "Kromatografi HPLC", "Validasi Metode Analisis", "Good Laboratory Practice (GLP)"],
  },
  "alice-smith": {
    id: "alice-smith",
    name: "Alice Smith",
    username: "alicesmith",
    nis: "222310401",
    class: "XII RPL 2",
    major: "rpl",
    majorName: "Rekayasa Perangkat Lunak",
    generation: 2024,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    bio: "Computer Vision enthusiast dan mobile developer. Suka merancang aplikasi yang memecahkan masalah riil di lingkungan sekolah.",
    currentCareer: "Mobile App Developer Freelance",
    status: "aktif",
    isPrivate: false,
    skills: ["Python", "TensorFlow", "React Native", "FastAPI", "OpenCV"],
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    contactEmail: "alice.smith@student.smkn13bandung.sch.id",
  },
  "budi-santoso": {
    id: "budi-santoso",
    name: "Budi Santoso",
    username: "budisantoso",
    nis: "222320104",
    class: "XII TKJ 1",
    major: "tkj",
    majorName: "Teknik Komputer Jaringan",
    generation: 2024,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    bio: "Penggemar keamanan siber, sniffing protocol, dan arsitektur data center mini sekolah. Mengelola lab jaringan SMKN 13 Bandung.",
    currentCareer: "Junior Sysadmin",
    status: "aktif",
    isPrivate: false,
    skills: ["WireShark", "Proxmox VE", "Firewall Iptables", "DNS & DHCP Server", "Debian"],
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    contactEmail: "budi.santoso@student.smkn13bandung.sch.id",
  },
  "anisa-rahma": {
    id: "anisa-rahma",
    name: "Anisa Rahmawati",
    username: "anisarahma",
    nis: "212230055",
    class: "XIII Analis Kimia 2",
    major: "analis-kimia",
    majorName: "Analis Kimia",
    generation: 2023,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    bio: "Pemenang LKS Bidang Kimia Terapan tingkat Provinsi Jawa Barat. Berpengalaman dalam analisis instrumen mikrobiologi dan pangan halal.",
    currentCareer: "R&D Assistant Lab",
    status: "aktif",
    isPrivate: false,
    skills: ["Analisis Titrimetri", "Gravimetri", "Spektrofotometri AAS", "Standarisasi Reagen ISO 17025"],
    socialLinks: {
      linkedin: "https://linkedin.com",
    },
    contactEmail: "anisa.rahma@student.smkn13bandung.sch.id",
  },
  "siti-nurhaliza": {
    id: "siti-nurhaliza",
    name: "Siti Nurhaliza",
    username: "sitinur",
    nis: "212230099",
    class: "XIII Analis Kimia 1",
    major: "analis-kimia",
    majorName: "Analis Kimia",
    generation: 2023,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bio: "Fokus pada pengujian residu pestisida pangan dan uji mutu air limbah domestik.",
    status: "aktif",
    isPrivate: true,
    privacyReason: "Profil dikunci atas permohonan siswa demi privasi data akademik.",
    skills: ["Kromatografi Gas (GC)", "Spektroskopi FTIR", "Kimia Lingkungan"],
  },
  "kevin-wijaya": {
    id: "kevin-wijaya",
    name: "Kevin Wijaya",
    username: "kevinw",
    nis: "222310488",
    class: "XII RPL 3",
    major: "rpl",
    majorName: "Rekayasa Perangkat Lunak",
    generation: 2024,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    bio: "Frontend engineer yang peduli aksesibilitas dan animasi web performan. Mengembangkan sistem perpustakaan digital sekolah.",
    currentCareer: "Frontend Developer Trainee",
    status: "aktif",
    isPrivate: false,
    skills: ["Vue.js", "Nuxt", "Tailwind CSS", "Motion", "REST API"],
    socialLinks: {
      github: "https://github.com",
    },
  },
  "gilang-ramadhan": {
    id: "gilang-ramadhan",
    name: "Gilang Ramadhan",
    username: "gilangr",
    nis: "222320144",
    class: "XII TKJ 3",
    major: "tkj",
    majorName: "Teknik Komputer Jaringan",
    generation: 2024,
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    bio: "Jaringan nirkabel dan mikrokontroler sensor jarak jauh LoRaWAN.",
    status: "aktif",
    isPrivate: true,
    privacyReason: "Profil ini tidak dipublikasikan karena pengaturan privasi pribadi.",
    skills: ["LoRaWAN", "MikroTik", "Raspberry Pi", "Grafana"],
  },
};

export const GALLERY_PROJECTS: GalleryProjectItem[] = [
  {
    id: "educlass-lms",
    title: "EduClass — LMS & Presensi QR Cerdas",
    tagline: "Platform e-learning terpadu dengan absensi berbasis QR Code dinamis dan rekapitulasi nilai otomatis.",
    description: "EduClass dirancang untuk mengatasi antrean presensi manual di 36 kelas SMKN 13 Bandung. Sistem ini menggunakan enkripsi token QR per 15 detik sehingga tidak dapat difoto atau dibagikan antar siswa. Dilengkapi dashboard analitik keterlambatan untuk wali kelas dan tim kesiswaan.",
    solutionHighlights: [
      "Token QR dinamis berubah setiap 15 detik dengan validasi geofencing lokasi sekolah.",
      "Dashboard kehadiran terintegrasi dengan WhatsApp Gateway notifikasi orang tua.",
      "Arsitektur serverless Next.js dengan response time presensi rata-rata < 120ms.",
    ],
    major: "rpl",
    majorLabel: "RPL",
    jurusan: "rpl",
    jurusanLabel: "RPL",
    year: 2025,
    coverImage: "/images/preview-rpl.jpg",
    galleryImages: [
      "/images/preview-rpl.jpg",
      "/images/hero-kolaborasi.jpg",
    ],
    status: "featured",
    badgeTier: "gold",
    badgeLabel: "Karya Terverifikasi Sekolah",
    tools: ["Next.js 14", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS", "Web Crypto API"],
    studentId: "farhan-maulana",
    studentName: "Farhan Maulana",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII RPL 1",
    isStudentPrivate: false,
    advisor: {
      name: "Drs. Bambang Heryanto, M.T.",
      role: "Ketua Program Keahlian RPL SMKN 13 Bandung",
      reviewNotes: "Arsitektur kode sangat bersih dan modular. Implementasi Web Crypto API untuk token rotasi presensi berhasil diuji coba pada 1.200 siswa tanpa kendala load.",
    },
    metrics: {
      views: 1420,
      likes: 184,
    },
    links: {
      demoUrl: "https://educlass.smkn13bandung.sch.id",
      githubUrl: "https://github.com/smkn13/educlass-lms",
      docUrl: "#",
    },
  },
  {
    id: "smart-green-iot",
    title: "Smart Green Energy Microcontroller IoT",
    tagline: "Sistem monitoring solar panel dan efisiensi konsumsi daya gedung sekolah berbasis ESP32.",
    description: "Proyek inovasi hemat energi yang menghubungkan 8 panel surya di atap gedung B dengan dashboard telemetri real-time. Memantau tegangan, arus, suhu panel, dan menghitung estimasi penghematan emisi karbon sekolah setiap hari.",
    solutionHighlights: [
      "Menggunakan protokol MQTT ringan untuk transmisi data sensor dari atap gedung setiap 2 detik.",
      "Otomasi relay pemutus beban saat tegangan baterai cadangan berada di bawah ambang aman.",
      "Penyimpanan time-series terdistribusi untuk analisis tren efisiensi sinar matahari bulanan.",
    ],
    major: "tkj",
    majorLabel: "TKJ",
    jurusan: "tkj",
    jurusanLabel: "TKJ",
    year: 2025,
    coverImage: "/images/preview-iot.jpg",
    galleryImages: [
      "/images/preview-iot.jpg",
      "/images/hero-tkj.jpg",
    ],
    status: "featured",
    badgeTier: "gold",
    badgeLabel: "Inovasi Hijau Sekolah",
    tools: ["ESP32", "C++", "MQTT Mosquitto", "Grafana", "Node-RED", "InfluxDB"],
    studentId: "rian-pratama",
    studentName: "Rian Pratama",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII TKJ 2",
    isStudentPrivate: true,
    advisor: {
      name: "Ahmad Fauzi, S.T., M.Kom.",
      role: "Guru Pembimbing Laboratorium Jaringan & IoT",
      reviewNotes: "Perakitan rangkaian perangkat keras sangat rapi sesuai standar industri. Integrasi ke Grafana memberikan visualisasi data yang jelas untuk tim sarana prasarana sekolah.",
    },
    metrics: {
      views: 980,
      likes: 142,
    },
    links: {
      docUrl: "#",
    },
  },
  {
    id: "formulasi-antosianin",
    title: "Formulasi Indikator Asam-Basa Antosianin Alami",
    tagline: "Ekstraksi pigmen bunga telang dan kubis ungu sebagai reagen uji pH ramah lingkungan di laboratorium.",
    description: "Riset kimia terapan yang memformulasikan indikator alternatif pengganti Phenolphthalein sintetis. Menguji stabilitas degradasi absorbansi antosianin pada berbagai rentang suhu penyimpanan dan pH 1-12 menggunakan spektrofotometer UV-Vis.",
    solutionHighlights: [
      "Sensitivitas perubahan warna jelas pada trayek pH 2.0 (merah muda) hingga pH 11.0 (kuning kehijauan).",
      "Biaya produksi 80% lebih hemat dibanding reagen sintetis impor.",
      "Limbah pengujian aman dibuang langsung ke IPAL laboratorium sekolah tanpa zat karsinogenik.",
    ],
    major: "analis-kimia",
    majorLabel: "Analis Kimia",
    jurusan: "analis-kimia",
    jurusanLabel: "Analis Kimia",
    year: 2025,
    coverImage: "/images/preview-kimia.jpg",
    galleryImages: [
      "/images/preview-kimia.jpg",
      "/images/hero-kimia.jpg",
    ],
    status: "featured",
    badgeTier: "gold",
    badgeLabel: "Riset Teruji Lab ISO",
    tools: ["Spektrofotometer UV-Vis", "pH Meter Kalibrasi", "Sentrifugasi", "Ekstraksi Maserasi", "Excel Data Curve"],
    studentId: "dewi-sartika",
    studentName: "Dewi Sartika Putri",
    studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    studentClass: "XIII Analis Kimia 1",
    isStudentPrivate: true,
    advisor: {
      name: "Dra. Nurhayati, M.Si.",
      role: "Kepala Laboratorium Kimia Analisis Terpadu",
      reviewNotes: "Metodologi penentuan kurva standar absorbansi dilakukan dengan presisi tinggi (R² = 0.998). Sangat layak dipublikasikan pada jurnal riset vokasi nasional.",
    },
    metrics: {
      views: 890,
      likes: 125,
    },
    links: {
      docUrl: "#",
    },
  },
  {
    id: "absensi-wajah-ai",
    title: "Sistem Absensi Wajah Berbasis AI Edge",
    tagline: "Deteksi dan pengenalan wajah multi-kandidat real-time dengan model MobileNetV2 dan Raspberry Pi 4.",
    description: "Sistem vision cerdas yang dapat mengenali siswa saat melintasi pintu gerbang masuk sekolah tanpa perlu berhenti menempelkan kartu. Mampu mengenali wajah dengan masker atau kacamata berkat teknik fine-tuning data lokal.",
    solutionHighlights: [
      "Inference on-device tanpa mengirim frame mentah ke cloud demi melindungi privasi biometrik.",
      "Akurasi deteksi 96.8% pada kondisi pencahayaan pagi hari dan sore hari.",
      "Waktu pengenalan < 350ms per wajah dengan batch processing hingga 3 orang bersamaan.",
    ],
    major: "rpl",
    majorLabel: "RPL",
    jurusan: "rpl",
    jurusanLabel: "RPL",
    year: 2025,
    coverImage: "/images/hero-kolaborasi.jpg",
    galleryImages: [
      "/images/hero-kolaborasi.jpg",
      "/images/preview-rpl.jpg",
    ],
    status: "verified",
    badgeTier: "silver",
    badgeLabel: "Terverifikasi Guru",
    tools: ["Python", "TensorFlow Lite", "OpenCV", "Raspberry Pi 4", "SQLite", "Flask API"],
    studentId: "alice-smith",
    studentName: "Alice Smith",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII RPL 2",
    isStudentPrivate: false,
    advisor: {
      name: "Ir. Hendra Gunawan, S.Pd.",
      role: "Instruktur AI & Rekayasa Perangkat Lunak",
      reviewNotes: "Optimalisasi model ke format TFLite sangat efektif mengurangi latency CPU. Implementasi etika biometrik diperhatikan dengan baik.",
    },
    metrics: {
      views: 1120,
      likes: 167,
    },
    links: {
      githubUrl: "https://github.com/smkn13/edge-face-ai",
      demoUrl: "#",
    },
  },
  {
    id: "monitoring-lan-school",
    title: "Monitoring Jaringan LAN Sekolah & Failover Otomatis",
    tagline: "Sistem pengawasan router mikrotik multi-ISP dengan visualisasi topologi live dan notifikasi bot Telegram.",
    description: "Infrastruktur jaringan handal yang memantau 14 switch distribusi dan 3 link ISP sekolah. Ketika ISP utama mengalami paket drop > 5%, script failover otomatis mengalihkan jalur data ke ISP cadangan dalam waktu 1.8 detik tanpa memutus sesi ujian online.",
    solutionHighlights: [
      "Failover transparan zero-downtime untuk 800+ komputer klien laboratorium.",
      "Alert Telegram real-time disertai detail port switch dan nilai bandwidth saat terjadi loop.",
      "Dashboard visualisasi interaktif bandwidth utilization per departemen.",
    ],
    major: "tkj",
    majorLabel: "TKJ",
    jurusan: "tkj",
    jurusanLabel: "TKJ",
    year: 2024,
    coverImage: "/images/hero-tkj.jpg",
    galleryImages: [
      "/images/hero-tkj.jpg",
      "/images/preview-iot.jpg",
    ],
    status: "verified",
    badgeTier: "silver",
    badgeLabel: "Terverifikasi Guru",
    tools: ["MikroTik RouterOS v7", "VRRP", "BGP Peering", "Prometheus", "SNMP", "Telegram Bot API"],
    studentId: "budi-santoso",
    studentName: "Budi Santoso",
    studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII TKJ 1",
    isStudentPrivate: false,
    advisor: {
      name: "Dedi Supriadi, S.Kom.",
      role: "Koordinator Tim IT & Jaringan SMKN 13",
      reviewNotes: "Konfigurasi recursive routing dan VRRP terbukti stabil selama pelaksanaan simulasi Asesmen Nasional Berbasis Komputer (ANBK).",
    },
    metrics: {
      views: 760,
      likes: 98,
    },
    links: {
      githubUrl: "https://github.com/smkn13/network-watchdog",
    },
  },
  {
    id: "analisis-kadar-logam",
    title: "Riset Analisis Kadar Logam Berat Timbal (Pb) di Air Sungai",
    tagline: "Penetapan konsentrasi Pb dan Cd pada Daerah Aliran Sungai Citarum Hulu dengan Spektrofotometri Serapan Atom.",
    description: "Studi komprehensif menguji kualitas air permukaan di sekitar pemukiman dan kawasan industri Rancasari. Sampel didegradasi dengan asam nitrat pekat microwave digestion, kemudian dianalisis menggunakan AAS pada panjang gelombang 283.3 nm.",
    solutionHighlights: [
      "Metode validasi mencakup limit of detection (LOD), limit of quantitation (LOQ), dan persen perolehan kembali (recovery).",
      "Memberikan rekomendasi tertulis kepada dinas lingkungan hidup terkait titik rawan sedimentasi.",
      "Standar akurasi tinggi dengan nilai deviasi relatif (RSD) di bawah 2.0%.",
    ],
    major: "analis-kimia",
    majorLabel: "Analis Kimia",
    jurusan: "analis-kimia",
    jurusanLabel: "Analis Kimia",
    year: 2024,
    coverImage: "/images/hero-kimia.jpg",
    galleryImages: [
      "/images/hero-kimia.jpg",
      "/images/preview-kimia.jpg",
    ],
    status: "featured",
    badgeTier: "gold",
    badgeLabel: "Juara 1 LKS Kimia Vokasi",
    tools: ["Spektrofotometer AAS", "Microwave Digester", "Neraca Analitik Mettler Toledo", "Air Destilasi Grade 1"],
    studentId: "anisa-rahma",
    studentName: "Anisa Rahmawati",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    studentClass: "XIII Analis Kimia 2",
    isStudentPrivate: false,
    advisor: {
      name: "Dr. Hj. Ratna Juwita, M.Pd.",
      role: "Waka Kurikulum & Penguji Ahli Analis Kimia",
      reviewNotes: "Karya ilmiah ini memenuhi kriteria akreditasi laboratorium ISO/IEC 17025. Data disajikan sangat rapi dan komprehensif.",
    },
    metrics: {
      views: 1250,
      likes: 210,
    },
    links: {
      docUrl: "#",
    },
  },
  {
    id: "manajemen-perpustakaan-rfid",
    title: "Aplikasi Manajemen Perpustakaan Digital & RFID",
    tagline: "Peminjaman mandiri berbasis RFID tag dan katalog buku digital terintegrasi OPAC.",
    description: "Menggantikan sistem kartu kertas lama dengan stasiun peminjaman mandiri buku. Siswa cukup meletakkan buku di atas reader RFID dan men-tap kartu pelajar untuk meminjam dalam 5 detik.",
    solutionHighlights: [
      "Self-checkout station membaca 3 buku sekaligus dengan sensor RFID anti-tabrakan.",
      "Katalog buku dengan algoritma pencarian semantik judul, penulis, dan nomor DDC.",
      "Perhitungan denda otomatis terintegrasi e-wallet kantin sekolah.",
    ],
    major: "rpl",
    majorLabel: "RPL",
    jurusan: "rpl",
    jurusanLabel: "RPL",
    year: 2025,
    coverImage: "/images/preview-rpl.jpg",
    galleryImages: ["/images/preview-rpl.jpg"],
    status: "verified",
    badgeTier: "silver",
    badgeLabel: "Terverifikasi Sekolah",
    tools: ["Vue 3", "Node.js", "Express", "RC522 RFID", "PostgreSQL", "Tailwind CSS"],
    studentId: "kevin-wijaya",
    studentName: "Kevin Wijaya",
    studentAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII RPL 3",
    isStudentPrivate: false,
    advisor: {
      name: "Drs. Bambang Heryanto, M.T.",
      role: "Ketua Program Keahlian RPL",
      reviewNotes: "Antarmuka ramah pengguna dan responsif. Berhasil mengurangi waktu antre di perpustakaan hingga 75%.",
    },
    metrics: {
      views: 640,
      likes: 72,
    },
  },
  {
    id: "smart-weather-lora",
    title: "Stasiun Cuaca Mikro Pertanian LoRaWAN",
    tagline: "Sensor pemantau kelembaban tanah dan curah hujan jarak jauh hingga radius 4 kilometer.",
    description: "Prototipe sistem agrikultur presisi yang memancarkan data cuaca dari kebun praktik hidroponik sekolah ke server pusat melalui modul radio LoRa frekuensi 915 MHz hemat baterai.",
    solutionHighlights: [
      "Transmisi data tembus rintangan gedung perkotaan hingga jarak 4.2 KM tanpa jaringan seluler.",
      "Ditenagai baterai 18650 dengan solar panel mini yang bertahan selama 6 bulan tanpa isi ulang manual.",
      "Peringatan dini kekeringan media tanam langsung ke pengurus green-house.",
    ],
    major: "tkj",
    majorLabel: "TKJ",
    jurusan: "tkj",
    jurusanLabel: "TKJ",
    year: 2024,
    coverImage: "/images/preview-iot.jpg",
    galleryImages: ["/images/preview-iot.jpg"],
    status: "verified",
    badgeTier: "bronze",
    badgeLabel: "Terverifikasi Guru",
    tools: ["LoRa SX1276", "Arduino IDE", "ChirpStack LoRa Server", "MQTT", "Grafana"],
    studentId: "gilang-ramadhan",
    studentName: "Gilang Ramadhan",
    studentAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII TKJ 3",
    isStudentPrivate: true,
    advisor: {
      name: "Ahmad Fauzi, S.T., M.Kom.",
      role: "Instruktur IoT & Embedded System",
      reviewNotes: "Efisiensi konsumsi daya perangkat sangat baik dengan mode deep-sleep terjadwal.",
    },
    metrics: {
      views: 520,
      likes: 61,
    },
  },
  {
    id: "uji-pestisida-sayur",
    title: "Uji Residu Pestisida Organofosfat pada Sayuran Pasar",
    tagline: "Metode skrining cepat penghambatan enzim kolinesterase dan kromatografi lapis tipis (KLT).",
    description: "Pengujian keamanan pangan terhadap sampel sawi dan selada dari pasar tradisional di Kota Bandung. Mengidentifikasi kandungan residu insektisida golongan organofosfat dan karbamat.",
    solutionHighlights: [
      "Metode biokimia cepat menggunakan ekstrak enzim kolinesterase dengan perubahan warna indofenol.",
      "Konfirmasi nilai Rf senyawa aktif menggunakan pelat KLT silika gel GF254 di bawah lampu UV.",
      "Memberikan edukasi teknik pencucian sayur yang efektif menghilangkan residu hingga 90%.",
    ],
    major: "analis-kimia",
    majorLabel: "Analis Kimia",
    jurusan: "analis-kimia",
    jurusanLabel: "Analis Kimia",
    year: 2024,
    coverImage: "/images/preview-kimia.jpg",
    galleryImages: ["/images/preview-kimia.jpg"],
    status: "verified",
    badgeTier: "silver",
    badgeLabel: "Terverifikasi Sekolah",
    tools: ["Kromatografi Lapis Tipis (KLT)", "Lampu UV 254/366 nm", "Inkubator Suhu Presisi", "Mikropipet Finnpipette"],
    studentId: "siti-nurhaliza",
    studentName: "Siti Nurhaliza",
    studentAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    studentClass: "XIII Analis Kimia 1",
    isStudentPrivate: true,
    advisor: {
      name: "Dra. Nurhayati, M.Si.",
      role: "Kepala Laboratorium Kimia Analisis Terpadu",
      reviewNotes: "Replikasi pengujian dilakukan secara triplo dengan hasil yang reprodusibel dan presisi.",
    },
    metrics: {
      views: 610,
      likes: 85,
    },
  },
  {
    id: "kandaga-collaborative-hub",
    title: "Platform Kolaborasi Karya Siswa Antar Jurusan",
    tagline: "Ruang koordinasi digital yang menghubungkan siswa RPL, TKJ, dan Kimia untuk proyek interdisipliner.",
    description: "Aplikasi web kolaboratif internal sekolah yang memfasilitasi integrasi proyek, pembagian tugas berbasis Scrum, dan penyimpanan repositori riset terpusat.",
    solutionHighlights: [
      "Manajemen kanban interaktif dengan notifikasi event real-time via WebSockets.",
      "Ruang penyimpanan artefak kode dan laporan lab dengan version control terintegrasi.",
      "Review otomatis kelayakan kurikulum oleh guru pembimbing sebelum proyek dipresentasikan.",
    ],
    major: "rpl",
    majorLabel: "RPL",
    jurusan: "rpl",
    jurusanLabel: "RPL",
    year: 2025,
    coverImage: "/images/hero-kolaborasi.jpg",
    galleryImages: ["/images/hero-kolaborasi.jpg"],
    status: "featured",
    badgeTier: "gold",
    badgeLabel: "Karya Terverifikasi Sekolah",
    tools: ["Next.js", "Tailwind CSS", "Socket.io", "PostgreSQL", "Docker"],
    studentId: "farhan-maulana",
    studentName: "Farhan Maulana",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII RPL 1",
    isStudentPrivate: false,
    advisor: {
      name: "Drs. Bambang Heryanto, M.T.",
      role: "Ketua Program Keahlian RPL",
      reviewNotes: "Sangat solutif memecahkan sekat antar jurusan di SMKN 13 Bandung.",
    },
    metrics: {
      views: 1340,
      likes: 195,
    },
  },
  {
    id: "cyber-security-honeypot",
    title: "Honeypot Network & Intrusion Detection Lab",
    tagline: "Perangkap intruksi siber berbasis Cowrie Honeypot untuk menangkap serangan brute-force SSH.",
    description: "Lingkungan virtual terkontrol yang mengekspos port SSH palsu ke internet publik guna mempelajari teknik penyerang siber dan mengumpulkan data log serangan untuk pelatihan keamanan siber siswa.",
    solutionHighlights: [
      "Mengumpulkan 12.000+ payload serangan dari IP asing dalam periode pengujian 1 bulan.",
      "Analisis pola password umum yang dicoba hacker dan pemetaan geolokasi penyerang.",
      "Integrasi alert otomatis ke platform Wazuh SIEM.",
    ],
    major: "tkj",
    majorLabel: "TKJ",
    jurusan: "tkj",
    jurusanLabel: "TKJ",
    year: 2024,
    coverImage: "/images/hero-tkj.jpg",
    galleryImages: ["/images/hero-tkj.jpg"],
    status: "verified",
    badgeTier: "gold",
    badgeLabel: "Lab Keamanan Siber",
    tools: ["Cowrie", "Wazuh SIEM", "Elasticsearch", "Kibana", "Ubuntu Server"],
    studentId: "budi-santoso",
    studentName: "Budi Santoso",
    studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII TKJ 1",
    isStudentPrivate: false,
    advisor: {
      name: "Dedi Supriadi, S.Kom.",
      role: "Instruktur Keamanan Jaringan",
      reviewNotes: "Analisis log sangat detail dan memberikan wawasan penting tentang ancaman siber riil.",
    },
    metrics: {
      views: 890,
      likes: 114,
    },
  },
  {
    id: "biodiesel-jelantah",
    title: "Konversi Minyak Jelantah Menjadi Biodiesel Standar SNI",
    tagline: "Proses transesterifikasi dua tahap dengan katalis basa KOH dan pemurnian dry-washing.",
    description: "Proyek daur ulang limbah minyak goreng kantin sekolah menjadi bahan bakar alternatif biodiesel. Menghasilkan bahan bakar dengan angka setana tinggi dan kadar asam lemak bebas (FFA) rendah di bawah 0.5%.",
    solutionHighlights: [
      "Konversi rendemen mencapai 88.5% dari volume minyak jelantah awal.",
      "Uji viskositas kinematik dan titik nyala memenuhi parameter SNI 7182:2015.",
      "Diuji coba langsung pada mesin genset laboratorium tanpa kendala pembakaran.",
    ],
    major: "analis-kimia",
    majorLabel: "Analis Kimia",
    jurusan: "analis-kimia",
    jurusanLabel: "Analis Kimia",
    year: 2024,
    coverImage: "/images/hero-kimia.jpg",
    galleryImages: ["/images/hero-kimia.jpg"],
    status: "featured",
    badgeTier: "gold",
    badgeLabel: "Inovasi Lingkungan",
    tools: ["Reaktor Transesterifikasi", "Viskometer Ostwald", "Piknometer", "Titrator Karl Fischer"],
    studentId: "anisa-rahma",
    studentName: "Anisa Rahmawati",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    studentClass: "XIII Analis Kimia 2",
    isStudentPrivate: false,
    advisor: {
      name: "Dr. Hj. Ratna Juwita, M.Pd.",
      role: "Waka Kurikulum & Penguji Ahli Analis Kimia",
      reviewNotes: "Penerapan prinsip green chemistry yang sangat konkret dan bernilai ekonomis tinggi.",
    },
    metrics: {
      views: 940,
      likes: 132,
    },
  },
  {
    id: "augmented-reality-lab-anatomy",
    title: "AR Kimia — Visualisasi Molekul Interaktif",
    tagline: "Aplikasi Augmented Reality untuk memvisualisasikan struktur geometri molekul dan ikatan kovalen 3D.",
    description: "Aplikasi mobile edukasi yang memungkinkan siswa memindai kartu rumus kimia untuk melihat proyeksi 3D orbital hibridisasi sp, sp2, dan sp3 secara interaktif melalui kamera smartphone.",
    solutionHighlights: [
      "Mendukung 45 struktur molekul organik dan anorganik dengan animasi putaran 360 derajat.",
      "Simulasi pemutusan dan pembentukan ikatan saat dua kartu didekatkan.",
      "Membantu pemahaman konsep abstrak kimia analitik bagi siswa tingkat X dan XI.",
    ],
    major: "rpl",
    majorLabel: "RPL",
    jurusan: "rpl",
    jurusanLabel: "RPL",
    year: 2024,
    coverImage: "/images/preview-rpl.jpg",
    galleryImages: ["/images/preview-rpl.jpg"],
    status: "verified",
    badgeTier: "silver",
    badgeLabel: "Media Edukasi Interaktif",
    tools: ["Unity", "AR Foundation", "C#", "Blender 3D", "Android SDK"],
    studentId: "alice-smith",
    studentName: "Alice Smith",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII RPL 2",
    isStudentPrivate: false,
    advisor: {
      name: "Ir. Hendra Gunawan, S.Pd.",
      role: "Instruktur RPL & Media Interaktif",
      reviewNotes: "Rendering 3D sangat halus di smartphone spek menengah siswa.",
    },
    metrics: {
      views: 820,
      likes: 104,
    },
  },
  {
    id: "smart-server-rack-climate",
    title: "Kontrol Iklim & Proteksi Kebakaran Rak Server",
    tagline: "Otomasi ventilasi induksi suhu dan deteksi gas aerosol pada data center mini sekolah.",
    description: "Sistem pengaman rak server berpendingin mandiri yang mengatur kecepatan exhaust fan berdasarkan titik panas (hot spots) di dalam casing server rack.",
    solutionHighlights: [
      "Mengurangi konsumsi listrik pendingin AC ruangan server hingga 22%.",
      "Sensor gas MQ-2 dan detektor optik asap terhubung ke solenoid pelepas gas CO2 darurat.",
      "Log suhu real-time disimpan pada kartu SD cadangan dan cloud server.",
    ],
    major: "tkj",
    majorLabel: "TKJ",
    jurusan: "tkj",
    jurusanLabel: "TKJ",
    year: 2025,
    coverImage: "/images/preview-iot.jpg",
    galleryImages: ["/images/preview-iot.jpg"],
    status: "verified",
    badgeTier: "silver",
    badgeLabel: "Terverifikasi Guru",
    tools: ["Arduino Mega", "Sensor DHT22", "Relay Module", "ESP8266 Wi-Fi", "Blynk IoT"],
    studentId: "rian-pratama",
    studentName: "Rian Pratama",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII TKJ 2",
    isStudentPrivate: true,
    advisor: {
      name: "Ahmad Fauzi, S.T., M.Kom.",
      role: "Guru Pembimbing Laboratorium Jaringan & IoT",
      reviewNotes: "Desain enclosure cetak 3D sangat pas dipasang pada rail standar rak server 19 inci.",
    },
    metrics: {
      views: 730,
      likes: 88,
    },
  },
  {
    id: "ekstraksi-minyak-atsiri-serai",
    title: "Ekstraksi & Karakterisasi Minyak Atsiri Serai Wangi",
    tagline: "Penyulingan uap-air (steam distillation) dan uji aktivitas antibakteri terhadap Staphylococcus aureus.",
    description: "Riset pemanfaatan tanaman obat lokal SMKN 13 Bandung. Menentukan rendemen minyak atsiri, indeks bias, bobot jenis, dan kadar sitronelal melalui titrasi iodometri dan GC-MS.",
    solutionHighlights: [
      "Rendemen optimal sebesar 1.42% diperoleh pada waktu distilasi 4 jam.",
      "Zona hambat antibakteri kategori sangat kuat (> 20 mm) pada uji difusi cakram kertas.",
      "Karakteristik fisik sesuai dengan standar kemurnian minyak serai SNI 06-3953-1995.",
    ],
    major: "analis-kimia",
    majorLabel: "Analis Kimia",
    jurusan: "analis-kimia",
    jurusanLabel: "Analis Kimia",
    year: 2024,
    coverImage: "/images/preview-kimia.jpg",
    galleryImages: ["/images/preview-kimia.jpg"],
    status: "verified",
    badgeTier: "gold",
    badgeLabel: "Riset Teruji Lab",
    tools: ["Aparatus Distilasi Uap", "Refraktometer Abbe", "Piknometer 10 mL", "Autoklaf Sterilisasi"],
    studentId: "dewi-sartika",
    studentName: "Dewi Sartika Putri",
    studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    studentClass: "XIII Analis Kimia 1",
    isStudentPrivate: true,
    advisor: {
      name: "Dra. Nurhayati, M.Si.",
      role: "Kepala Laboratorium Kimia Analisis Terpadu",
      reviewNotes: "Perhitungan indeks bias dan uji kemurnian dilakukan dengan sangat teliti.",
    },
    metrics: {
      views: 670,
      likes: 91,
    },
  },
  {
    id: "portal-bkk-mitra-industri",
    title: "Portal Bursa Kerja Khusus (BKK) & Rekrutmen Mitra",
    tagline: "Platform penghubung resmi antara siswa/alumni SMKN 13 dengan 40+ perusahaan mitra industri.",
    description: "Sistem terintegrasi yang mempermudah BKK sekolah memvalidasi lowongan PKL dan lowongan kerja dari mitra DUDI, memfilter profil siswa yang memenuhi kriteria, dan melacak status rekrutmen alumni.",
    solutionHighlights: [
      "Fitur verifikasi dokumen legalitas perusahaan mitra terintegrasi.",
      "Pencocokan kompetensi otomatis antara keahlian siswa dengan deskripsi lowongan.",
      "Laporan tracer study alumni otomatis sesuai format Direktorat SMK Kemendikbud.",
    ],
    major: "rpl",
    majorLabel: "RPL",
    jurusan: "rpl",
    jurusanLabel: "RPL",
    year: 2025,
    coverImage: "/images/hero-kolaborasi.jpg",
    galleryImages: ["/images/hero-kolaborasi.jpg"],
    status: "featured",
    badgeTier: "gold",
    badgeLabel: "Sistem Resmi Sekolah",
    tools: ["Next.js", "Prisma", "TypeScript", "PostgreSQL", "NextAuth.js"],
    studentId: "kevin-wijaya",
    studentName: "Kevin Wijaya",
    studentAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    studentClass: "XII RPL 3",
    isStudentPrivate: false,
    advisor: {
      name: "Drs. Bambang Heryanto, M.T.",
      role: "Ketua Program Keahlian RPL",
      reviewNotes: "Sistem ini langsung diadopsi oleh unit BKK sekolah untuk proses rekrutmen tahun ajaran baru.",
    },
    metrics: {
      views: 1180,
      likes: 156,
    },
  },
];

export function getGalleryProjects(): GalleryProjectItem[] {
  return GALLERY_PROJECTS;
}

export function getProjectById(id: string): GalleryProjectItem | undefined {
  return GALLERY_PROJECTS.find((p) => p.id === id);
}

export function getStudentById(id: string): StudentProfileData | undefined {
  return STUDENT_PROFILES[id];
}

export function getRelatedProjects(currentId: string, majorOrJurusan?: string): GalleryProjectItem[] {
  if (!majorOrJurusan) return [];
  return GALLERY_PROJECTS.filter(
    (p) => p.id !== currentId && (p.major === majorOrJurusan || p.jurusan === majorOrJurusan)
  ).slice(0, 3);
}

export function getProjectsByStudentId(studentId: string): GalleryProjectItem[] {
  return GALLERY_PROJECTS.filter((p) => p.studentId === studentId);
}
