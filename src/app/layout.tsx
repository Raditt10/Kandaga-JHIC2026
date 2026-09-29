import type { Metadata } from "next";
import { Poppins, Inter, Tangerine } from "next/font/google";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";
import "./globals.css";
import AuthProvider from "@/lib/AuthProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
      className={`${poppins.variable} ${inter.variable} ${tangerine.variable}`}
    >
      <body suppressHydrationWarning>
        <AuthProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
