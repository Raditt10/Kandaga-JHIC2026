import type { Metadata, Viewport } from "next";
import { Poppins, Plus_Jakarta_Sans, Tangerine, Montserrat, Bebas_Neue } from "next/font/google";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";
import AuthProvider from "@/lib/AuthProvider";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${poppins.variable} ${jakartaSans.variable} ${tangerine.variable} ${montserrat.variable} ${bebasNeue.variable}`}
    >
      <body suppressHydrationWarning>
        <KeepTitle />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <AuthProvider>
          <SmoothScrollProvider>
            {children}
            <ChatWidget />
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
