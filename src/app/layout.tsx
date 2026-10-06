import type { Metadata, Viewport } from "next";
import { Poppins, Plus_Jakarta_Sans, Tangerine, Montserrat, Bebas_Neue } from "next/font/google";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";
import AuthProvider from "@/lib/AuthProvider";
import ThemeWatcher from "@/lib/ThemeWatcher";
import { DASHBOARD_PREFIXES } from "@/lib/theme";
import KeepTitle from "@/components/layout/KeepTitle";
import ChatWidget from "@/components/chat/ChatWidget";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const tangerine = Tangerine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tangerine",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});

/**
 * URL kanonik situs. Dipakai untuk metadataBase, sitemap, robots, dan data
 * terstruktur. Setel NEXT_PUBLIC_SITE_URL di server produksi (mis.
 * "https://kandaga.smknegeri13bandung.sch.id") supaya tautan kanonik dan
 * pratinjau tautan menunjuk domain yang benar. Kalau tidak disetel, nilainya
 * jatuh ke NEXTAUTH_URL.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

const SITE_NAME = "Kandaga";

const SITE_DESCRIPTION =
  "Etalase digital karya terbaik siswa SMKN 13 Bandung — terverifikasi sekolah, terbuka untuk industri. Menghubungkan karya siswa dengan perusahaan mitra melalui BKK sekolah.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kandaga",
    template: "Kandaga",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "karya siswa",
    "portofolio siswa SMK",
    "SMKN 13 Bandung",
    "SMK Negeri 13 Bandung",
    "etalase digital sekolah",
    "talenta vokasi",
    "RPL",
    "TKJ",
    "Analis Kimia",
    "BKK",
    "magang siswa SMK",
  ],
  authors: [{ name: "Tim Ijin Tampil — SMKN 13 Bandung" }],
  creator: "Tim Ijin Tampil",
  publisher: "SMKN 13 Bandung",
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Kandaga",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kandaga",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
  },
  // Nomor telepon/alamat di dalam teks tidak perlu diubah jadi tautan otomatis
  // oleh sebagian peramban — sering salah mendeteksi angka di dalam karya.
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8B1A2F",
};

/**
 * Data terstruktur (schema.org). Memberi tahu mesin pencari bahwa ini galeri
 * karya milik sebuah sekolah, bukan situs umum. Dua simpul: sekolahnya, lalu
 * situsnya sebagai penerbit.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#sekolah`,
      name: "SMK Negeri 13 Bandung",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bandung",
        addressRegion: "Jawa Barat",
        addressCountry: "ID",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "id-ID",
      publisher: { "@id": `${SITE_URL}/#sekolah` },
    },
  ],
};

/**
 * Skrip anti-kedip (anti-FOUC) untuk tema.
 *
 * Harus berjalan SEBELUM halaman dicat, jadi ditulis sebagai skrip klasik
 * sebaris dan bukan komponen React — kalau menunggu hidrasi, tema gelap baru
 * muncul setelah halaman terang sempat terlihat berkedip. Isinya defensif:
 * kalau localStorage diblokir, halaman tetap tampil normal.
 *
 * Tema gelap hanya dipasang di area login; halaman publik selalu terang.
 * Daftar areanya diambil dari DASHBOARD_PREFIXES supaya tidak ada dua sumber
 * kebenaran yang bisa saling menyimpang.
 */
const THEME_BOOTSTRAP = `(function(){try{
var p=location.pathname;
var dash=${JSON.stringify(DASHBOARD_PREFIXES)}.some(function(x){return p===x||p.indexOf(x+"/")===0});
var r=document.documentElement;
if(!dash){r.classList.remove("dark");r.style.colorScheme="light";return}
var m=localStorage.getItem("kandaga_theme")||"system";
var d=m==="dark"||(m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);
r.classList.toggle("dark",!!d);r.style.colorScheme=d?"dark":"light";
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${poppins.variable} ${jakartaSans.variable} ${tangerine.variable} ${montserrat.variable} ${bebasNeue.variable}`}
    >
      {/*
        Skrip anti-kedip tema diletakkan di <head>, bukan di dalam <body>.

        Dua alasan:
        1. HARUS berjalan sebelum halaman digambar. Elemen <script> di <head>
           dieksekusi saat HTML diurai, jadi tema sudah benar sebelum piksel
           pertama muncul — ini inti anti-kedipnya.
        2. React hanya menghidrasi isi <body>. Skrip inline di dalam pohon
           React memicu peringatan "Encountered a script tag while rendering
           React component" karena React tidak pernah mengeksekusi skrip inline
           buatan klien. Di <head>, React tidak menyentuhnya.
      */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body suppressHydrationWarning>
        {/* Skrip anti-kedip TIDAK di sini — lihat <head> di atas. */}
        <ThemeWatcher />
        <KeepTitle />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <AuthProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
