export interface ProgramUnggulan {
  title: string;
  desc: string;
  badge: string;
  iconName: string;
}

export interface TahapanBelajar {
  phase: string;
  title: string;
  desc: string;
  skills: string[];
}

export interface FasilitasLab {
  name: string;
  spec: string;
  features: string[];
}

export interface ProspekKarir {
  role: string;
  desc: string;
  demand: string;
}

export interface JurusanDetail {
  id: string;
  code: string;
  name: string;
  tagline: string;
  duration: string;
  accreditation: string;
  heroImage: string;
  accentColor: string;
  secondaryColor: string;
  description: string;
  coreFocus: string[];
  programs: ProgramUnggulan[];
  learningJourney: TahapanBelajar[];
  dailyActivities: string[];
  facilities: FasilitasLab[];
  careers: ProspekKarir[];
  toolsTech: string[];
  highlightProject: {
    title: string;
    category: string;
    desc: string;
    link: string;
  };
}

export const JURUSAN_DATA: JurusanDetail[] = [
  {
    id: "rpl",
    code: "PPLG • RPL",
    name: "Rekayasa Perangkat Lunak",
    tagline: "Membangun Solusi Digital Modern, Berstandar Industri Masa Depan",
    duration: "3 Tahun Pembelajaran",
    accreditation: "Akreditasi A (Unggul)",
    heroImage: "/images/preview-rpl.jpg",
    accentColor: "#8B1A2F",
    secondaryColor: "#E8C97A",
    description:
      "Program Keahlian Rekayasa Perangkat Lunak (PPLG) SMKN 13 Bandung membekali siswa dengan keahlian komprehensif dalam perancangan, pengembangan, pengujian, dan pemeliharaan perangkat lunak. Berorientasi pada standar industri modern, kurikulum mencakup pengembangan web full-stack, aplikasi mobile, UI/UX design, komputasi awan, hingga integrasi database skala besar.",
    coreFocus: [
      "Web Full-Stack Development (React, Next.js, Node.js)",
      "Mobile Application Development (Flutter, React Native)",
      "UI/UX Design & User Research (Figma)",
      "Database & Cloud Infrastructure (PostgreSQL, Supabase, GCP)",
      "Software Quality Assurance & Clean Code Architecture",
    ],
    programs: [
      {
        title: "Student Software House (Teaching Factory)",
        desc: "Siswa mengerjakan proyek perangkat lunak nyata dari instansi, UMKM, dan mitra industri dengan skema manajemen agile modern layaknya tech-company profesional.",
        badge: "Produksi Riil",
        iconName: "Code2",
      },
      {
        title: "Hackathon & Inovasi Aplikasi Kandaga",
        desc: "Kompetisi pembuatan prototipe solusi digital berkala untuk memecahkan persoalan riil di lingkungan sekolah dan komunitas masyarakat perkotaan.",
        badge: "Inovasi Siswa",
        iconName: "Sparkles",
      },
      {
        title: "Mentorship & Code Review Mitra Industri",
        desc: "Sesi review kode, refactoring, dan sharing best practice arsitektur sistem secara rutin langsung bersama software engineer dari perusahaan rintisan dan korporasi teknologi.",
        badge: "Standar Industri",
        iconName: "UsersCheck",
      },
      {
        title: "Sertifikasi Kompetensi BNSP & Internasional",
        desc: "Sertifikasi keahlian pemrograman resmi Badan Nasional Sertifikasi Profesi (BNSP) dan lisensi industri pendukung untuk validasi portofolio profesional.",
        badge: "Terakreditasi",
        iconName: "Award",
      },
    ],
    learningJourney: [
      {
        phase: "Fase 1 (Tingkat X)",
        title: "Fondasi Logika Pemrograman & Antarmuka Dasar",
        desc: "Penguasaan dasar algoritma, struktur data, computational thinking, HTML5/CSS3 semantik, JavaScript modern, serta dasar desain UI/UX di Figma.",
        skills: ["Algoritma Pemrograman", "Responsive Web Design", "Git & GitHub", "Figma Prototyping"],
      },
      {
        phase: "Fase 2 (Tingkat XI)",
        title: "Full-Stack Development & Arsitektur Database",
        desc: "Membangun aplikasi dinamis dengan frontend framework modern, arsitektur RESTful API, database relasional (SQL) dan non-relasional, serta state management.",
        skills: ["Next.js / React", "Node.js & Express", "PostgreSQL & Prisma", "API Integration"],
      },
      {
        phase: "Fase 3 (Tingkat XII)",
        title: "Software Production, QA, dan Deployment Cloud",
        desc: "Eksekusi proyek akhir berskala enterprise, implementasi automated testing, continuous integration/continuous deployment (CI/CD), dan publikasi aplikasi ke publik.",
        skills: ["Unit & E2E Testing", "Docker & Cloud Deployment", "Agile/Scrum Workflow", "Sertifikasi BNSP"],
      },
    ],
    dailyActivities: [
      "Menganalisis kebutuhan user dan merancang blueprint arsitektur sistem",
      "Slicing antarmuka web & mobile dengan pendekatan mobile-first serta aksesibilitas tinggi",
      "Membangun REST API dan GraphQL server yang aman dan terdokumentasi rapi",
      "Melakukan standup harian, code review di Git repository, dan sprint review",
      "Menyusun dokumentasi teknis sistem dan mempublikasikan karya ke portofolio Kandaga",
    ],
    facilities: [
      {
        name: "Lab Software Engineering & Mac Workstation",
        spec: "PC Core i7/i9 32GB RAM + GPU RTX Series, Dual-Monitor Setup, macOS workstation untuk build iOS.",
        features: ["High-speed Dedicated Internet", "Ergonomic Chairs", "Interactive Agile Board"],
      },
      {
        name: "Server & Cloud Simulation Lab",
        spec: "Private server mini-rack untuk simulasi deployment lokal, staging environment, dan Docker cluster.",
        features: ["Local Staging Server", "Backup Power UPS", "Firewall Protection"],
      },
    ],
    careers: [
      {
        role: "Frontend / Web Developer",
        desc: "Membangun tampilan web interaktif, performan tinggi, dan responsif menggunakan framework modern.",
        demand: "Tinggi — Permintaan industri digital berkelanjutan",
      },
      {
        role: "Backend / API Engineer",
        desc: "Mengelola arsitektur server, basis data, keamanan logika bisnis, dan integrasi microservice.",
        demand: "Tinggi — Sangat dibutuhkan startup dan korporasi",
      },
      {
        role: "Mobile Application Developer",
        desc: "Membuat aplikasi smartphone Android dan iOS multi-platform dengan standar native-performance.",
        demand: "Tinggi — Ekosistem mobile yang terus berekspansi",
      },
      {
        role: "Quality Assurance (QA) & Tester",
        desc: "Menguji keandalan fungsional, performa beban, dan keamanan aplikasi sebelum rilis resmi.",
        demand: "Stabil — Kunci keandalan rilis produk software",
      },
    ],
    toolsTech: ["TypeScript", "Next.js", "React", "Node.js", "Python", "Tailwind CSS", "PostgreSQL", "Docker", "Git", "Figma"],
    highlightProject: {
      title: "Kandaga Digital Showcase Platform",
      category: "Full-Stack Web App",
      desc: "Sistem etalase karya digital siswa berbasis Next.js dengan verifikasi sekolah terintegrasi dan sistem kurasi real-time.",
      link: "/galeri?jurusan=RPL",
    },
  },
  {
    id: "tkj",
    code: "TJKT • TKJ",
    name: "Teknik Komputer & Jaringan",
    tagline: "Infrastruktur Jaringan Andal, Keamanan Siber, & Konektivitas Internet",
    duration: "3 Tahun Pembelajaran",
    accreditation: "Akreditasi A (Unggul)",
    heroImage: "/images/hero-tkj.jpg",
    accentColor: "#1A365D",
    secondaryColor: "#319795",
    description:
      "Program Keahlian Teknik Komputer dan Jaringan (TJKT) SMKN 13 Bandung mencetak spesialis infrastruktur digital yang menguasai instalasi jaringan skala luas, konfigurasi perangkat jaringan enterprise, administrasi server Linux/Windows, keamanan siber (cybersecurity), teknologi fiber optik, hingga Internet of Things (IoT).",
    coreFocus: [
      "Enterprise Routing & Switching (Cisco, Mikrotik)",
      "Cybersecurity Defense & Network Penetration Basics",
      "Linux & Windows Server Administration, Virtualization, & Cloud",
      "Fiber Optic Cabling, FTTH, & Fusion Splicing",
      "Internet of Things (IoT) Hardware & Sensor Integration",
    ],
    programs: [
      {
        title: "Cisco & Mikrotik Academy Certification Center",
        desc: "Kurikulum resmi tersertifikasi internasional yang mempersiapkan siswa meraih lisensi bergengsi seperti CCNA (Cisco) dan MTCNA (MikroTik).",
        badge: "Sertifikasi Global",
        iconName: "ShieldCheck",
      },
      {
        title: "Network Operations Center (NOC) Siswa",
        desc: "Praktek langsung mengelola, memonitor, dan merawat infrastruktur jaringan internet riil di seluruh area kampus SMKN 13 Bandung.",
        badge: "Operasional Kampus",
        iconName: "Activity",
      },
      {
        title: "Cyber Defense & Ethical Hacking Lab",
        desc: "Simulasi skenario serangan jaringan, konfigurasi firewall berlapis, audit keamanan lalu lintas data, serta pemulihan bencana sistem (disaster recovery).",
        badge: "Keamanan Siber",
        iconName: "Lock",
      },
      {
        title: "Fiber Optic Installation & Splice Workshop",
        desc: "Pelatihan teknis penyambungan kabel serat optik menggunakan Fusion Splicer presisi tinggi dan pengukuran transmisi dengan OTDR standar telekomunikasi.",
        badge: "Keahlian Lapangan",
        iconName: "Zap",
      },
    ],
    learningJourney: [
      {
        phase: "Fase 1 (Tingkat X)",
        title: "Perakitan Komputer, Sistem Operasi, & Jaringan Dasar",
        desc: "Pemahaman arsitektur perangkat keras komputer, instalasi OS open-source Linux, subnetting IP address (IPv4 & IPv6), serta pembuatan kabel UTP standar TIA/EIA.",
        skills: ["Hardware Architecture", "Linux CLI Essentials", "IPv4/IPv6 Subnetting", "LAN Cabling & Testing"],
      },
      {
        phase: "Fase 2 (Tingkat XI)",
        title: "Routing Switching Enterprise & Server Administration",
        desc: "Konfigurasi protokol routing dinamis (OSPF, BGP), VLAN, Spanning Tree, manajemen bandwidth Mikrotik, setup DNS/Web/Mail Server di Linux Server.",
        skills: ["Cisco IOS Configuration", "Mikrotik RouterOS", "Linux Server (Debian/Ubuntu)", "VLAN & Inter-VLAN Routing"],
      },
      {
        phase: "Fase 3 (Tingkat XII)",
        title: "Cybersecurity, Fiber Optik, & Cloud Computing",
        desc: "Penyambungan core fiber optik FTTH, pengujian OTDR, konfigurasi VPN & Firewall IDS/IPS, manajemen container Docker, dan persiapan sertifikasi industri.",
        skills: ["Fiber Splicing & OTDR", "Firewall & IDS/IPS", "Docker & Virtualization", "Sertifikasi CCNA/MTCNA"],
      },
    ],
    dailyActivities: [
      "Mendesain topologi jaringan berskala enterprise menggunakan simulator Cisco Packet Tracer & GNS3",
      "Melakukan konfigurasi routerboard Mikrotik dan switch Cisco pada rack-server laboratorium",
      "Menyambungkan kabel fiber optik dengan mesin fusion splicer dan memverifikasi dB loss dengan optical power meter",
      "Mengadministrasikan server Linux berbasis command-line, backup data otomatis, dan monitoring server",
      "Menganalisis paket data mencurigakan dengan Wireshark untuk deteksi dini anomali jaringan",
    ],
    facilities: [
      {
        name: "Laboratorium Cisco & MikroTik Enterprise Rack",
        spec: "Rak server 42U dengan Router Cisco 2900 series, Catalyst Switch layer 2/3, MikroTik Cloud Router Switch.",
        features: ["Dedicated Patch Panels", "Console Terminal Hubs", "Power Distribution Units (PDU)"],
      },
      {
        name: "Workshop Fiber Optic & FTTH Telecommunication",
        spec: "Mesin Fusion Splicer presisi, Optical Time Domain Reflectometer (OTDR), OPM & VFL laser pen.",
        features: ["Distribusi Kabel Indoor/Outdoor", "OTB Wall Mount", "Safety Handling Kit"],
      },
    ],
    careers: [
      {
        role: "Network Engineer / Administrator",
        desc: "Merancang, menginstalasi, dan menjaga kelancaran operasional lalu lintas jaringan komputer perusahaan.",
        demand: "Sangat Tinggi — Dibutuhkan setiap institusi modern",
      },
      {
        role: "Cybersecurity & SOC Analyst",
        desc: "Menjaga pertahanan sistem jaringan dari ancaman kebocoran data, malware, dan serangan siber.",
        demand: "Lompatan Tertinggi — Kebutuhan siber nasional meningkat",
      },
      {
        role: "System & Cloud Administrator",
        desc: "Mengelola server fisik maupun virtual di platform komputasi awan (AWS, Google Cloud, Azure).",
        demand: "Tinggi — Transformasi digital korporat ke cloud",
      },
      {
        role: "Fiber Optic Specialist / Field Technician",
        desc: "Teknisi instalasi, penyambungan, dan maintenance jalur pita lebar broadband telekomunikasi.",
        demand: "Stabil — Proyek ekspansi internet kecepatan tinggi",
      },
    ],
    toolsTech: ["Cisco IOS", "MikroTik RouterOS", "Linux Debian/Ubuntu", "Wireshark", "Docker", "GNS3", "Fusion Splicer", "OTDR", "Proxmox VE"],
    highlightProject: {
      title: "Smart Campus IoT Gateway & Centralized NOC",
      category: "Network Infrastructure & IoT",
      desc: "Infrastruktur jaringan kampus nirkabel dengan otentikasi RADIUS terpadu dan sistem monitoring suhu ruangan server via sensor IoT.",
      link: "/galeri?jurusan=TKJ",
    },
  },
  {
    id: "analis-kimia",
    code: "AK • ANALIS KIMIA",
    name: "Analis Kimia (4 Tahun)",
    tagline: "Presisi Pengujian Laboratorium, Standar Mutu Industri Internasional",
    duration: "4 Tahun Program Keahlian",
    accreditation: "Akreditasi A (Unggul)",
    heroImage: "/images/hero-kimia.jpg",
    accentColor: "#4E0E20",
    secondaryColor: "#E8C97A",
    description:
      "Program Keahlian Analis Kimia SMKN 13 Bandung merupakan salah satu program vokasi unggulan nasional berdurasi 4 tahun (setara diploma dasar). Membekali siswa dengan kompetensi mendalam di bidang analisis kimia konvensional (volumetri, gravimetri), kimia instrumen canggih (spektrofotometri UV-Vis, AAS, kromatografi gas/cair), mikrobiologi industri, serta jaminan mutu standar ISO/IEC 17025.",
    coreFocus: [
      "Analisis Kimia Kuantitatif & Kualitatif Konvensional (Titrimetri & Gravimetri)",
      "Pengoperasian Kimia Instrumen Modern (AAS, GC, HPLC, UV-Vis Spectrophotometer)",
      "Mikrobiologi Terapan & Pengujian Keamanan Pangan / Farmasi",
      "Analisis Kualitas Lingkungan (Uji Air Limbah BOD/COD, Udara, & Tanah)",
      "Penerapan Good Laboratory Practice (GLP) & Akreditasi Lab ISO/IEC 17025",
    ],
    programs: [
      {
        title: "Laboratorium Pengujian Terakreditasi Berstandar Industri",
        desc: "Praktikum intensif berstandar ISO/IEC 17025 yang melatih kepatuhan regulasi, traceability pengukuran, dan akurasi kalibrasi instrumen tinggi.",
        badge: "Standar ISO 17025",
        iconName: "FlaskConical",
      },
      {
        title: "Praktik Kerja Industri 4 Tahun (Internship Mandiri)",
        desc: "Siswa tingkat akhir menjalani program magang industri berskala penuh (6 hingga 10 bulan) di perusahaan farmasi multinasional, petrokimia, dan laboratorium BPOM.",
        badge: "Magang 10 Bulan",
        iconName: "Briefcase",
      },
      {
        title: "Sertifikasi Profesi Lembaga Sertifikasi Kimia (LSP-P1)",
        desc: "Uji sertifikasi kompetensi skema Analis Kimia Terpadu berlisensi BNSP yang diakui secara luas oleh asosiasi industri kimia dan farmasi Indonesia.",
        badge: "Sertifikasi BNSP",
        iconName: "CheckCircle2",
      },
      {
        title: "Riset Terapan Formulasi Produk & Uji Halal",
        desc: "Pengembangan produk inovasi seperti sintesis bioplastik ramah lingkungan, ekstraksi minyak atsiri herbal, dan validasi keaslian kandungan bahan pangan.",
        badge: "Riset Vokasi",
        iconName: "Search",
      },
    ],
    learningJourney: [
      {
        phase: "Fase 1 (Tingkat X)",
        title: "Dasar Operasi Laboratorium & Kimia Analisis Dasar",
        desc: "Keselamatan kerja (K3LH), teknik penimbangan teliti di neraca analitik, pembuatan larutan baku, standardisasi, serta analisis kation-anion kualitatif.",
        skills: ["K3LH Laboratorium", "Neraca Analitik Presisi", "Pembuatan Larutan Baku", "Analisis Kualitatif Anorganik"],
      },
      {
        phase: "Fase 2 (Tingkat XI)",
        title: "Analisis Volumetri, Gravimetri, & Mikrobiologi Dasar",
        desc: "Titrasi asam-basa, kompleksometri, permanganometri, iodometri, penetapan kadar gravimetri, teknik sterilisasi, isolasi mikroba, dan uji ALT/MPN.",
        skills: ["Titrimetri Lengkap", "Gravimetri Termogravimetri", "Teknik Aseptik & Sterilisasi", "Kultur Mikroorganisme"],
      },
      {
        phase: "Fase 3 (Tingkat XII)",
        title: "Kimia Instrumen Canggih & Analisis Lingkungan",
        desc: "Operasional Spektrofotometer UV-Vis, AAS untuk analisis logam berat (Pb, Cu, Fe), Kromatografi Gas/Cair (GC/HPLC), serta pengujian parameter limbah air.",
        skills: ["Spektrofotometri UV-Vis & AAS", "Kromatografi GC / HPLC", "Uji BOD, COD, DO Air Limbah", "Validasi Metode Uji"],
      },
      {
        phase: "Fase 4 (Tingkat XIII)",
        title: "Praktik Kerja Industri Penuh & Uji Kelulusan Vokasi 4 Tahun",
        desc: "Penempatan kerja intensif di industri mitra (Quality Control / Research & Development), penyusunan tugas akhir riset, dan uji kompetensi akhir berlisensi.",
        skills: ["Industrial QC/QA Workflow", "ISO 17025 Audit Compliance", "Tugas Akhir Riset Industri", "Uji Sertifikasi BNSP"],
      },
    ],
    dailyActivities: [
      "Mengambil sampel uji (sampling) dengan teknik representatif sesuai SOP standar industri",
      "Melakukan penimbangan bahan menggunakan neraca analitik 4 desimal dengan presisi tinggi",
      "Melaksanakan titrasi dan preparasi sampel destruksi asam untuk pembacaan instrumen",
      "Mengoperasikan instrumen spektrofotometer dan mengolah kurva kalibrasi konsentrasi",
      "Mendokumentasikan data hasil uji ke dalam Certificate of Analysis (CoA) resmi",
    ],
    facilities: [
      {
        name: "Laboratorium Kimia Instrumen Modern",
        spec: "Atomic Absorption Spectrophotometer (AAS), UV-Vis Double Beam Spectrophotometer, Flame Photometer, Digital Polarimeter.",
        features: ["Ruang Ber-AC Suhu Konstan", "Fume Hood / Lemari Asam Otomatis", "Gas Regulator Safety System"],
      },
      {
        name: "Laboratorium Mikrobiologi & Bioproses Steril",
        spec: "Laminar Air Flow (LAF) Cabinet, Autoclave digital bertekanan, Inkubator bakteri/jamur, Colony Counter digital.",
        features: ["HEPA Filtration Room", "UV Sterilization Lamp", "Mikroskop Binokuler Digital"],
      },
      {
        name: "Laboratorium Analisis Konvensional & Volumetri",
        spec: "Meja uji keramik tahan asam, buret otomatis, desikator vakum, furnace pemijar hingga 1000°C.",
        features: ["Shower Keselamatan Darurat (Eyewash)", "Sistem Pembuangan Limbah B3", "Wastafel Netralisasi"],
      },
    ],
    careers: [
      {
        role: "Quality Control (QC) Analyst",
        desc: "Memastikan bahan baku dan produk jadi pabrik farmasi, makanan, atau kosmetik memenuhi spesifikasi mutu ketat.",
        demand: "Sangat Tinggi — Dibutuhkan setiap industri manufaktur",
      },
      {
        role: "Quality Assurance (QA) Staff",
        desc: "Mengaudit kepatuhan sistem mutu laboratorium, validasi dokumen, dan kepatuhan standar ISO/BPOM.",
        demand: "Tinggi — Regulasi industri kesehatan & pangan semakin ketat",
      },
      {
        role: "Research & Development (R&D) Technician",
        desc: "Membantu formulator dan saintis dalam uji stabilitas produk baru dan inovasi bahan kimia alternatif.",
        demand: "Tinggi — Sektor riset material dan kosmetik bertumbuh",
      },
      {
        role: "Environmental Laboratory Analyst",
        desc: "Menguji baku mutu limbah cair, emisi udara, dan air tanah di laboratorium lingkungan dan instansi pemerintah.",
        demand: "Stabil — Tuntutan regulasi hijau ESG perusahaan",
      },
    ],
    toolsTech: ["AAS Spectrophotometer", "UV-Vis Spectrophotometer", "HPLC / Gas Chromatography", "Autoclave & LAF", "pH Meter Digital", "Analytical Balance (0.0001g)", "Muffle Furnace", "K3LH Safety Protocol"],
    highlightProject: {
      title: "Uji Parameter Mutu Air Minum Isi Ulang & Pengolahan Limbah Logam",
      category: "Laboratorium Kimia Lingkungan",
      desc: "Riset terapan pengujian kadar tembaga (Cu) dan besi (Fe) menggunakan AAS serta uji mikrobiologi bakteri Coliform sesuai standar Permenkes.",
      link: "/galeri?jurusan=Analis+Kimia",
    },
  },
];
