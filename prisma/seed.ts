// prisma/seed.ts
import { PrismaClient, Role, ProjectType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start Seeding database...')

  // Clear existing records (urutan penting: dependen dulu)
  await prisma.auditLogs.deleteMany()
  await prisma.notifications.deleteMany()
  await prisma.partnerships.deleteMany()
  await prisma.contactRequests.deleteMany()
  await prisma.bookmarks.deleteMany()
  await prisma.projectsBadge.deleteMany()
  await prisma.projectsTool.deleteMany()
  await prisma.projectsMedia.deleteMany()
  await prisma.projects.deleteMany()
  await prisma.badges.deleteMany()
  await prisma.skillTool.deleteMany()
  await prisma.company.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.student.deleteMany()
  await prisma.major.deleteMany()
  await prisma.users.deleteMany()

  console.log('🗑️  Existing data cleared.')

  // Hash password sekali, dipakai semua demo user
  // Password: "password123" sesuai login page demo
  const hashedPassword = await bcrypt.hash('password123', 12)

  // ── Demo Users — username sesuai login page demo accounts ──────────
  const userdata = [
    { name: "siswa13",           email: "siswa13@gmail.com",           passwordHash: "password123", role: "student" },
    { name: "guru13",            email: "guru13@gmail.com",            passwordHash: "password123", role: "teacher" },
    { name: "mitra_perusahaan",  email: "mitra_perusahaan@gmail.com",  passwordHash: "password123", role: "company" },
    { name: "inovasisiber",      email: "inovasisiber@gmail.com",      passwordHash: "password123", role: "company" },
    { name: "nusantaraanalitika",email: "nusantaraanalitika@gmail.com",passwordHash: "password123", role: "company" },
    { name: "logistikpratama",   email: "logistikpratama@gmail.com",   passwordHash: "password123", role: "company" },
    { name: "admin13",           email: "admin13@gmail.com",           passwordHash: "password123", role: "admin"   },
    { name: "bkk13",             email: "bkk13@gmail.com",             passwordHash: "password123", role: "bkk"     },
  ]

  const userMap: Record<string, { id: string; name: string; email: string }> = {}

  for (const user of userdata) {
    const created = await prisma.users.create({
      data: {
        name:         user.name,
        email:        user.email,
        passwordHash: hashedPassword,   // bcrypt hash dari "password123"
        role:         mapRole(user.role),
        status:       'aktif',
      },
    })
    userMap[user.name] = created
    console.log(`  ✓ Created: ${user.name} (${user.role})`)
  }

  // ── Majors ─────────────────────────────────────────────────────────
  const majorsdata = [
    {
      name:        'Analis Kimia',
      fullName:    'Analis Kimia',
      image:       '/images/hero-kimia.jpg',
      link:        '/jurusan/analis-kimia',
      description: 'Jurusan yang berfokus pada analisis laboratorium, pengujian bahan kimia, dan riset berbasis sains terapan.',
    },
    {
      name:        'TKJ',
      fullName:    'Teknik Komputer Jaringan',
      image:       '/images/hero-tkj.jpg',
      link:        '/jurusan/tkj',
      description: 'Jurusan yang mempelajari infrastruktur jaringan komputer, keamanan sistem, dan administrasi server.',
    },
    {
      name:        'RPL',
      fullName:    'Rekayasa Perangkat Lunak',
      image:       '/images/preview-rpl.jpg',
      link:        '/jurusan/rpl',
      description: 'Jurusan yang fokus pada pengembangan aplikasi web, mobile, dan sistem informasi berbasis kode.',
    },
  ]

  
  for (const major of majorsdata) {
    await prisma.major.create({ data: major })
    console.log(`  ✓ Major: ${major.name}`)
  }

  // ── Student & Teacher Profiles ──────────────────────────────────────
  const rplMajor = await prisma.major.findUnique({ where: { name: 'RPL' } })

  if (rplMajor && userMap['siswa13']) {
    await prisma.student.create({
      data: {
        userId:     userMap['siswa13'].id,
        majorId:    rplMajor.id,
        nis:        '1324001',
        class:      'XII RPL 1',
        generation: 2024,
        status:     'aktif',
        bio:        'Siswa Rekayasa Perangkat Lunak SMKN 13 Bandung berfokus pada Fullstack Web & UI/UX.',
      },
    })
    console.log('  ✓ Profile: Student siswa13')
  }

  if (rplMajor && userMap['guru13']) {
    await prisma.teacher.create({
      data: {
        userId:  userMap['guru13'].id,
        majorId: rplMajor.id,
        nip:     '198001012005011003',
        bio:     'Guru Pengampu Rekayasa Perangkat Lunak SMKN 13 Bandung.',
      },
    })
    console.log('  ✓ Profile: Teacher guru13')
  }

  // ── Company Profiles (Metadata Kaya untuk Verifikasi BKK / Admin) ────
  const bkkUser = userMap['bkk13']

  const companiesToSeed = [
    {
      userKey:            'mitra_perusahaan',
      name:               'PT Sintesis Digital Nusantara',
      field:              'Teknologi Informasi & Software',
      description:        'Perusahaan software house dan transformasi digital yang berfokus pada pengembangan sistem enterprise, arsitektur cloud modern, dan platform edukasi interaktif. Telah menjadi mitra industri SMKN 13 Bandung dalam program magang kerja dan penyerapan lulusan unggul.',
      address:            'Jl. Terusan Buah Batu No. 42A, Batununggal',
      city:               'Kota Bandung',
      province:           'Jawa Barat',
      phone:              '+62 22 7564120',
      website:            'https://sintesisdigital.id',
      nib:                '9120304918291',
      npwp:               '01.345.678.9-422.000',
      employeeCount:      '51-200 karyawan',
      foundedYear:        2018,
      logoUrl:            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=240&h=240&q=80',
      picName:            'Raden Arya Pratama, S.Kom.',
      picPosition:        'Head of People & Engineering Culture',
      picEmail:           'arya.pratama@sintesisdigital.id',
      picPhone:           '+62 812-2345-6789',
      documentUrl:        'https://drive.google.com/file/d/demo-legalitas-nib-sintesis/view',
      verificationStatus: 'disetujui',
      verifiedBy:         bkkUser ? bkkUser.id : null,
      verifiedAt:         new Date(Date.now() - 14 * 86400000),
      catatanVerifikasi:  null,
    },
    {
      userKey:            'inovasisiber',
      name:               'PT Inovasi Siber Kreasi',
      field:              'Telekomunikasi & Jaringan',
      description:        'Penyedia infrastruktur jaringan fiber optic, managed network security, dan audit cybersecurity untuk korporasi serta institusi pendidikan di Jawa Barat. Menawarkan program magang Network Engineer dan Cyber Defense untuk siswa TKJ.',
      address:            'Kawasan Niaga Metro Trade Center Blok D-15, Soekarno-Hatta',
      city:               'Kota Bandung',
      province:           'Jawa Barat',
      phone:              '+62 22 8734910',
      website:            'https://inovasisiber.co.id',
      nib:                '1284920194827',
      npwp:               '02.891.234.5-429.000',
      employeeCount:      '1-50 karyawan',
      foundedYear:        2021,
      logoUrl:            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=240&h=240&q=80',
      picName:            'Dewi Lestari, S.T.',
      picPosition:        'Talent Acquisition & Partnership Lead',
      picEmail:           'dewi.lestari@inovasisiber.co.id',
      picPhone:           '+62 813-9876-5432',
      documentUrl:        'https://drive.google.com/file/d/demo-legalitas-siber/view',
      verificationStatus: 'pending',
      verifiedBy:         null,
      verifiedAt:         null,
      catatanVerifikasi:  null,
    },
    {
      userKey:            'nusantaraanalitika',
      name:               'PT Lab Nusantara Analitika',
      field:              'Kimia & Farmasi',
      description:        'Laboratorium pengujian mutu industri, kalibrasi instrumen analitik canggih, dan analisis kimia lingkungan bersertifikasi KAN ISO/IEC 17025. Membuka kuota PKL industri kimia untuk siswa kompetensi keahlian Analisis Kimia.',
      address:            'Jl. Soekarno-Hatta No. 112, Babakan Ciparay',
      city:               'Kota Bandung',
      province:           'Jawa Barat',
      phone:              '+62 22 6012948',
      website:            'https://nusantaraanalitika.com',
      nib:                '0294819284719',
      npwp:               '03.456.789.0-421.000',
      employeeCount:      '51-200 karyawan',
      foundedYear:        2016,
      logoUrl:            'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=240&h=240&q=80',
      picName:            'Dr. Hendra Gunawan, M.Si.',
      picPosition:        'Kepala Laboratorium & QA',
      picEmail:           'hendra.gunawan@nusantaraanalitika.com',
      picPhone:           '+62 811-3456-7890',
      documentUrl:        'https://drive.google.com/file/d/demo-legalitas-lab/view',
      verificationStatus: 'pending',
      verifiedBy:         null,
      verifiedAt:         null,
      catatanVerifikasi:  null,
    },
    {
      userKey:            'logistikpratama',
      name:               'CV Karya Logistik Pratama',
      field:              'Manufaktur & Industri',
      description:        'Vendor logistik pergudangan dan suplai suku cadang mekanikal perakitan ringan untuk manufaktur kawasan industri Bandung Raya.',
      address:            'Jl. Raya Kopo Sayati No. 209',
      city:               'Kabupaten Bandung',
      province:           'Jawa Barat',
      phone:              '+62 22 5410982',
      website:            'https://karyalogistik.co.id',
      nib:                '9988776655443',
      npwp:               '04.567.890.1-445.000',
      employeeCount:      '1-50 karyawan',
      foundedYear:        2022,
      logoUrl:            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=240&h=240&q=80',
      picName:            'Budi Santoso',
      picPosition:        'Operasional Gudang & Kemitraan',
      picEmail:           'budi.santoso@karyalogistik.co.id',
      picPhone:           '+62 856-7890-1234',
      documentUrl:        'https://drive.google.com/file/d/demo-invalid-doc/view',
      verificationStatus: 'ditolak',
      verifiedBy:         bkkUser ? bkkUser.id : null,
      verifiedAt:         new Date(Date.now() - 3 * 86400000),
      catatanVerifikasi:  'Dokumen NIB yang dilampirkan belum mencakup KBLI sektor industri terkait dan masa berlaku SK Kemenkumham belum diperbarui. Mohon perbarui berkas legalitas pada profil Anda dan ajukan kembali verifikasi.',
    },
  ]

  for (const c of companiesToSeed) {
    const user = userMap[c.userKey]
    if (user) {
      await prisma.company.create({
        data: {
          userId:             user.id,
          name:               c.name,
          field:              c.field,
          description:        c.description,
          address:            c.address,
          city:               c.city,
          province:           c.province,
          phone:              c.phone,
          website:            c.website,
          nib:                c.nib,
          npwp:               c.npwp,
          employeeCount:      c.employeeCount,
          foundedYear:        c.foundedYear,
          logoUrl:            c.logoUrl,
          picName:            c.picName,
          picPosition:        c.picPosition,
          picEmail:           c.picEmail,
          picPhone:           c.picPhone,
          documentUrl:        c.documentUrl,
          verificationStatus: c.verificationStatus,
          verifiedBy:         c.verifiedBy,
          verifiedAt:         c.verifiedAt,
          catatanVerifikasi:  c.catatanVerifikasi,
        },
      })
      console.log(`  ✓ Company: ${c.name} (${c.verificationStatus})`)
    }
  }

  const galleryData = [
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
        advisorId: "bambang-heryanto",
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
        advisorId: "ahmad-fauzi",
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
        advisorId: "nurhayati",
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
        advisorId: "hendra-gunawan",
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
        advisorId: "dedi-supriadi",
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
        advisorId: "ratna-juwita",
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
        advisorId: "bambang-heryanto",
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
        advisorId: "ahmad-fauzi",
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
        advisorId: "nurhayati",
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
        advisorId: "bambang-heryanto",
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
        advisorId: "dedi-supriadi",
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
        advisorId: "ratna-juwita",
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
        advisorId: "hendra-gunawan",
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
        advisorId: "ahmad-fauzi",
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
        advisorId: "nurhayati",
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
      advisor: {
        name: "Drs. Bambang Heryanto, M.T.",
        advisorId: "bambang-heryanto",
        role: "Ketua Program Keahlian RPL",
        reviewNotes: "Sistem ini langsung diadopsi oleh unit BKK sekolah untuk proses rekrutmen tahun ajaran baru.",
      },
      metrics: {
        views: 1180,
        likes: 156,
      },
    },
  ];

  // ══════════════════════════════════════════════════════════════════════
  // DATA DEMO LENGKAP DARI GALLERYDATA & ADMIN
  // ══════════════════════════════════════════════════════════════════════

  const u = Object.fromEntries((await prisma.users.findMany()).map((x) => [x.name, x]))
  const m = Object.fromEntries((await prisma.major.findMany()).map((x) => [x.name, x]))

  console.log('  🎨 Seeding rich Gallery Projects...')
  for (const g of galleryData) {
    const majorKey = g.major === 'analis-kimia' ? 'Analis Kimia' : g.major.toUpperCase()
    const targetMajor = m[majorKey] || m['RPL']

    // 1. Student User
    let sUser = await prisma.users.findFirst({
      where: { email: `${g.studentId}@smkn13bdg.sch.id` },
    })
    if (!sUser) {
      sUser = await prisma.users.create({
        data: {
          name: g.studentName,
          email: `${g.studentId}@smkn13bdg.sch.id`,
          passwordHash: hashedPassword,
          role: Role.Student,
          status: 'aktif',
          avatarUrl: g.studentAvatar,
        },
      })
      u[g.studentId] = sUser
    }

    // Student profile
    const sProfile = await prisma.student.findUnique({
      where: { userId: sUser.id },
    })
    if (!sProfile) {
      await prisma.student.create({
        data: {
          userId: sUser.id,
          majorId: targetMajor.id,
          nis: `22231${Math.floor(1000 + Math.random() * 9000)}`,
          class: g.studentClass,
          generation: g.year,
          status: 'aktif',
          bio: `Siswa kompetensi keahlian ${targetMajor.fullName} SMKN 13 Bandung.`,
          photoUrl: g.studentAvatar,
        },
      })
    }

    // 2. Advisor User
    const advKey = g.advisor.advisorId || 'guru13'
    let advUser = await prisma.users.findFirst({
      where: { email: `${advKey}@smkn13bdg.sch.id` },
    })
    if (!advUser) {
      advUser = await prisma.users.create({
        data: {
          name: g.advisor.name,
          email: `${advKey}@smkn13bdg.sch.id`,
          passwordHash: hashedPassword,
          role: Role.Teacher,
          status: 'aktif',
        },
      })
      u[advKey] = advUser
    }

    const tProfile = await prisma.teacher.findUnique({
      where: { userId: advUser.id },
    })
    if (!tProfile) {
      await prisma.teacher.create({
        data: {
          userId: advUser.id,
          majorId: targetMajor.id,
          nip: `1980${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          bio: g.advisor.role,
        },
      })
    }

    // 3. Project
    const pType = g.major === 'analis-kimia' ? ProjectType.KA : g.major.toUpperCase() === 'TKJ' ? ProjectType.TKJ : ProjectType.RPL
    const project = await prisma.projects.create({
      data: {
        studentId: sUser.id,
        advisorId: advUser.id,
        type: pType,
        title: g.title,
        description: g.description,
        year: g.year,
        status: 'approved',
        coverImage: g.coverImage,
        reviewNotes: g.advisor.reviewNotes,
        reviewedBy: advUser.id,
        publishedAt: new Date(),
        viewCount: g.metrics.views,
        stars: g.metrics.likes,
        isPrivate: false,
      },
    })

    // 4. Media
    const images = g.galleryImages && g.galleryImages.length > 0 ? g.galleryImages : [g.coverImage]
    for (let ord = 0; ord < images.length; ord++) {
      await prisma.projectsMedia.create({
        data: {
          projectId: project.id,
          url: images[ord],
          type: 'photo',
          order: ord,
        },
      })
    }

    // 5. Main features / solution highlights
    if (g.solutionHighlights && g.solutionHighlights.length > 0) {
      for (const feat of g.solutionHighlights) {
        await prisma.projectsMainFeatures.create({
          data: {
            projectId: project.id,
            feature: feat,
          },
        }).catch(() => {})
      }
    }
  }

  const IMG = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`

  // ── Profil siswa tambahan (supaya galeri tidak hanya berisi 1 jurusan) ──
  const extraStudentUsers = [
    { name: 'siswa_tkj13',   email: 'siswa.tkj@smkn13bdg.sch.id',   major: 'TKJ',          nis: '2026130001', cls: 'XII TKJ 1' },
    { name: 'siswa_kimia13', email: 'siswa.kimia@smkn13bdg.sch.id', major: 'Analis Kimia', nis: '2026130002', cls: 'XII AK 1'  },
  ]
  for (const s of extraStudentUsers) {
    if (u[s.name]) continue
    u[s.name] = await prisma.users.create({
      data: {
        name:         s.name,
        email:        s.email,
        passwordHash: hashedPassword,
        role:         Role.Student,
        status:       'aktif',
      },
    })
    console.log(`  ✓ Created: ${s.name} (student)`)
  }

  // ── Profil Siswa ───────────────────────────────────────────────────────
  const studentProfiles = [
    { user: 'siswa13',       major: 'RPL',          nis: '2026130000', cls: 'XII RPL 1', gen: 2026, bio: 'Siswa RPL yang fokus pada pengembangan aplikasi web.' },
    { user: 'siswa_tkj13',   major: 'TKJ',          nis: '2026130001', cls: 'XII TKJ 1', gen: 2026, bio: 'Fokus pada infrastruktur jaringan dan keamanan sistem.' },
    { user: 'siswa_kimia13', major: 'Analis Kimia', nis: '2026130002', cls: 'XII AK 1',  gen: 2026, bio: 'Tertarik pada analisis laboratorium dan kimia terapan.' },
  ]
  for (const p of studentProfiles) {
    if (!u[p.user]) continue
    const existing = await prisma.student.findUnique({ where: { userId: u[p.user].id } })
    if (existing) continue
    await prisma.student.create({
      data: {
        userId:     u[p.user].id,
        majorId:    m[p.major].id,
        nis:        p.nis,
        class:      p.cls,
        generation: p.gen,
        status:     'aktif',
        bio:        p.bio,
      },
    })
    console.log(`  ✓ Student profile: ${p.user} (${p.major})`)
  }

  // ── Profil Guru ────────────────────────────────────────────────────────
  if (u['guru13']) {
    const existingTeacher = await prisma.teacher.findUnique({ where: { userId: u['guru13'].id } })
    if (!existingTeacher) {
      await prisma.teacher.create({
        data: { userId: u['guru13'].id, majorId: m['RPL'].id, nip: '198501012010011001' },
      })
      console.log('  ✓ Teacher profile: guru13 (RPL)')
    }
  }

  // ── Profil Perusahaan ──────────────────────────────────────────────────
  const extraCompanyUsers = [
    { name: 'adit',  email: 'adit@ijintampil.id', role: Role.Company },
    { name: 'dzaha', email: 'dzaha@creepix.com',  role: Role.Company },
  ]
  for (const c of extraCompanyUsers) {
    if (!u[c.name]) {
      u[c.name] = await prisma.users.create({
        data: {
          name:         c.name,
          email:        c.email,
          passwordHash: hashedPassword,
          role:         c.role,
          status:       'aktif',
        },
      })
      console.log(`  ✓ Created user: ${c.name} (company)`)
    }
  }

  const companyProfiles = [
    { user: 'mitra_perusahaan', name: 'PT Mitra Inovasi Nusantara', field: 'Teknologi Informasi', status: 'disetujui' },
    { user: 'adit',             name: 'Ijin Tampil',                field: 'Teknologi Informasi', status: 'disetujui' },
    { user: 'dzaha',            name: 'Creepix Inc',                field: 'Teknologi Informasi', status: 'pending'   },
  ]
  for (const c of companyProfiles) {
    if (!u[c.user]) continue
    const existingComp = await prisma.company.findUnique({ where: { userId: u[c.user].id } })
    if (existingComp) continue
    const disetujui = c.status === 'disetujui'
    await prisma.company.create({
      data: {
        userId:             u[c.user].id,
        name:               c.name,
        field:              c.field,
        verificationStatus: c.status,
        documentUrl:        'https://example.com/dokumen-legalitas.pdf',
        verifiedBy:         disetujui ? u['bkk13']?.id : null,
        verifiedAt:         disetujui ? new Date() : null,
      },
    })
    console.log(`  ✓ Company profile: ${c.name} (${c.status})`)
  }

  // ── Karya siswa ────────────────────────────────────────────────────────
  const projectSeed = [
    { student: 'siswa13',       type: 'RPL', status: 'approved', title: 'Kandaga — Galeri Digital Karya Siswa',
      desc: 'Platform galeri digital dan portal kolaborasi industri untuk SMKN 13 Bandung, dibangun dengan Next.js, Prisma, dan PostgreSQL.' },
    { student: 'siswa13',       type: 'RPL', status: 'approved', title: 'Sistem Absensi QR Code Berbasis Web',
      desc: 'Absensi siswa memakai QR code dengan rekap otomatis ke dashboard guru dan laporan harian.' },
    { student: 'siswa13',       type: 'RPL', status: 'pending',  title: 'Aplikasi Kasir UMKM Sekolah',
      desc: 'Aplikasi kasir sederhana untuk kantin sekolah, mendukung pencatatan stok dan laporan penjualan harian.' },
    { student: 'siswa_tkj13',   type: 'TKJ', status: 'approved', title: 'Monitoring Jaringan Sekolah dengan SNMP',
      desc: 'Sistem pemantauan perangkat jaringan sekolah berbasis SNMP dengan notifikasi saat perangkat turun.' },
    { student: 'siswa_tkj13',   type: 'TKJ', status: 'approved', title: 'Hotspot Voucher Otomatis Berbasis Mikrotik',
      desc: 'Manajemen hotspot sekolah dengan voucher otomatis, pembatasan kuota, dan laporan penggunaan.' },
    { student: 'siswa_tkj13',   type: 'TKJ', status: 'pending',  title: 'VPN Server untuk Akses Lab Jarak Jauh',
      desc: 'Server VPN untuk mengakses perangkat laboratorium dari luar sekolah dengan autentikasi berlapis.' },
    { student: 'siswa_kimia13', type: 'KA',  status: 'approved', title: 'Analisis Kadar Vitamin C pada Buah Lokal',
      desc: 'Penetapan kadar vitamin C pada buah lokal dengan metode titrasi iodometri, dibandingkan dengan standar literatur.' },
    { student: 'siswa_kimia13', type: 'KA',  status: 'approved', title: 'Uji Kualitas Air Sungai Citarum',
      desc: 'Pengujian parameter kimia air sungai meliputi pH, BOD, dan kadar logam berat, disusun sebagai laporan riset.' },
  ]

  const createdProjects: { id: string; title: string }[] = []
  for (let i = 0; i < projectSeed.length; i++) {
    const p        = projectSeed[i]
    const approved = p.status === 'approved'

    const created = await prisma.projects.create({
      data: {
        studentId:   u[p.student].id,
        advisorId:   u['guru13'].id,
        type:        p.type as ProjectType,
        title:       p.title,
        description: p.desc,
        year:        2026,
        status:      p.status,
        reviewedBy:  approved ? u['guru13'].id : null,
        publishedAt: approved ? new Date() : null,
        reviewNotes: approved ? 'Karya layak ditampilkan di galeri publik.' : null,
        viewCount:   approved ? 10 + i * 7 : 0,
      },
    })
    createdProjects.push({ id: created.id, title: p.title })

    await prisma.projectsMedia.createMany({
      data: [
        { projectId: created.id, url: IMG(`kandaga-${i}-a`), type: 'photo', order: 0 },
        { projectId: created.id, url: IMG(`kandaga-${i}-b`), type: 'photo', order: 1 },
      ],
    })
  }
  console.log(`  ✓ ${createdProjects.length} karya + media (6 approved, 2 pending)`)

  // ── Permintaan kontak (antrian BKK) ────────────────────────────────────
  const approvedTitles = projectSeed
    .filter((p) => p.status === 'approved')
    .map((p) => p.title)

  const contactSeed: {
    project: string; purpose: string; status: string; message: string; bkkNotes?: string
  }[] = [
    { project: approvedTitles[0], purpose: 'magang', status: 'terkirim',
      message: 'Kami ingin menawarkan program magang 3 bulan untuk siswa pembuat karya ini. Mohon dibantu penghubungan.' },
    { project: approvedTitles[3], purpose: 'kerja', status: 'ditinjau',
      message: 'Kami tertarik merekrut siswa ini sebagai network engineer junior setelah lulus. Mohon informasi lanjutan.' },
    { project: approvedTitles[1], purpose: 'kolaborasi', status: 'diteruskan',
      message: 'Kami ingin berkolaborasi mengembangkan karya ini menjadi produk yang dipakai sekolah lain.',
      bkkNotes: 'Sudah dihubungkan dengan siswa dan guru pembimbing.' },
    { project: approvedTitles[5], purpose: 'magang', status: 'ditolak',
      message: 'Kami ingin mengajak siswa ini magang di laboratorium kami.',
      bkkNotes: 'Ditolak: kuota magang jurusan ini sudah terpenuhi pada periode yang diminta.' },
  ]

  for (const c of contactSeed) {
    const target = createdProjects.find((p) => p.title === c.project)
    if (!target) continue
    await prisma.contactRequests.create({
      data: {
        companyId:  u['mitra_perusahaan'].id,
        projectId:  target.id,
        purpose:    c.purpose,
        message:    c.message,
        status:     c.status,
        bkkNotes:   c.bkkNotes ?? null,
        reviewedBy: c.status === 'terkirim' ? null : u['bkk13'].id,
        reviewedAt: c.status === 'terkirim' ? null : new Date(),
      },
    })
  }
  console.log(`  ✓ ${contactSeed.length} permintaan kontak (2 aktif, 2 riwayat)`)

  // ── Audit Logs ─────────────────────────────────────────────────────────
  console.log('  📋 Seeding Audit Logs...')
  const adminUser = u['admin13'] || (await prisma.users.findFirst({ where: { role: Role.Admin } }))
  const sampleAuditLogs = [
    { action: "ROLE_ASSIGNMENT", entity: "users", detail: "Menetapkan peran BKK kepada pengguna bkk13", status: "SUCCESS" },
    { action: "CURATION_APPROVAL", entity: "projects", detail: "Menyetujui proyek 'EduClass — LMS & Presensi QR' ke Galeri Utama", status: "SUCCESS" },
    { action: "INTERNSHIP_POSTED", entity: "internship_applications", detail: "Membuka lowongan magang PKL 'Junior Frontend Engineer'", status: "SUCCESS" },
    { action: "PROJECT_SUBMISSION", entity: "projects", detail: "Mengunggah proyek tugas akhir baru ke antrean kurasi", status: "SUCCESS" },
    { action: "COMPANY_VERIFIED", entity: "companies", detail: "Memverifikasi profil kemitraan industri PT Sintesis Digital Nusantara", status: "SUCCESS" },
  ]
  for (const log of sampleAuditLogs) {
    await prisma.auditLogs.create({
      data: {
        userId: adminUser ? adminUser.id : null,
        action: log.action,
        entity: log.entity,
        data: { detail: log.detail, status: log.status },
      },
    })
  }

  // ── Admin Notifications ───────────────────────────────────────────────
  console.log('  🔔 Seeding Admin Notifications...')
  if (adminUser) {
    const adminNotifData = [
      {
        type: "project_created",
        title: "Karya Siswa Baru Diunggah",
        content: "Farhan Maulana (XII RPL 1) mengunggah karya baru: 'EduClass — LMS & Presensi QR Cerdas'.",
      },
      {
        type: "company_registered",
        title: "Pendaftaran Mitra Industri Baru",
        content: "PT Sintesis Digital Nusantara mengajukan kemitraan magang PKL ke BKK SMKN 13.",
      },
      {
        type: "curation_review",
        title: "Catatan Kurasi Guru Pembimbing",
        content: "Drs. Bambang Heryanto, M.T. meloloskan kurasi karya ke Galeri Publik.",
      },
      {
        type: "security_alert",
        title: "Audit Keamanan & Hak Akses",
        content: "Pemberian hak akses guru kurator baru disahkan oleh Administrator Utama.",
      },
    ]
    for (const notif of adminNotifData) {
      await prisma.notifications.create({
        data: {
          userId: adminUser.id,
          type: notif.type,
          title: notif.title,
          content: notif.content,
          isRead: false,
        },
      })
    }
  }

  // ── FAQs ───────────────────────────────────────────────────────────────
  console.log('  ❓ Seeding FAQs...')
  const faqsToSeed = [
    {
      q: "Bagaimana cara sebuah karya siswa bisa masuk ke Galeri Publik Kandaga?",
      a: "Karya harus diunggah oleh siswa, kemudian melalui proses peninjauan dan kurasi teknis oleh guru pembimbing jurusan. Setelah disetujui, karya otomatis terbit di galeri publik.",
    },
    {
      q: "Apakah perusahaan mitra industri dapat langsung merekrut atau menghubungi siswa?",
      a: "Perusahaan yang telah terverifikasi oleh BKK SMKN 13 dapat mengirimkan permohonan minat melalui platform. BKK akan memfasilitasi dan mengoordinasikan pertemuan resmi antara perusahaan, siswa, dan sekolah.",
    },
    {
      q: "Siapa saja yang memiliki hak akses untuk mengelola data di portal Kandaga?",
      a: "Hak kelola sistem terbagi menjadi 5 peran: Siswa (pembuat karya), Guru (kurator & penilai), Mitra Industri (pemberi peluang kerja/magang), BKK (penyalur kerja), dan Administrator Utama (pengawas sistem).",
    },
  ]
  if (u['siswa13'] && adminUser) {
    for (const f of faqsToSeed) {
      await prisma.fAQs.create({
        data: {
          askerId: u['siswa13'].id,
          replierId: adminUser.id,
          question: f.q,
          answer: f.a,
        },
      })
    }
  }

  console.log('\n✅ Seeding completed!')
  console.log('─────────────────────────────────')

  console.log('Demo login credentials (semua password: password123):')
  console.log('  siswa13 / password123          → /student')
  console.log('  admin13 / password123          → /admin/dashboard')
  console.log('  mitra_perusahaan / password123 → /company  (perusahaan disetujui)')
  console.log('  guru13 / password123           → /teacher')
  console.log('  bkk13 / password123            → /bkk')
  console.log('  siswa_tkj13 / password123      → /student')
  console.log('  siswa_kimia13 / password123    → /student')
  console.log('  dzaha / password123            → /mitra/menunggu  (perusahaan pending)')

  console.log('─────────────────────────────────')
}

function mapRole(role: string): Role {
  switch (role.toLowerCase()) {
    case 'admin':   return Role.Admin
    case 'student': return Role.Student
    case 'teacher': return Role.Teacher
    case 'company': return Role.Company
    case 'bkk':     return Role.BKK
    default:        return Role.Student
  }
}

function mapProjectType(value: string): ProjectType {
  switch (value.toLowerCase()){
    case 'rpl': return ProjectType.RPL
    case 'tkj': return ProjectType.TKJ
    case 'ka': return ProjectType.KA
    default: return ProjectType.RPL
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
