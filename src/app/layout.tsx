import type { Metadata } from "next";
import { Poppins, Inter, Tangerine, Montserrat, Bebas_Neue } from "next/font/google";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";
import AuthProvider from "@/lib/AuthProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
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

export const metadata: Metadata = {
  title: "Kandaga — Galeri Digital Karya Siswa SMKN 13 Bandung",
  description:
    "Etalase digital karya terbaik siswa SMKN 13 Bandung — terverifikasi sekolah, terbuka untuk industri.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable} ${tangerine.variable} ${montserrat.variable} ${bebasNeue.variable}`}
    >
      <body suppressHydrationWarning>
        <AuthProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
