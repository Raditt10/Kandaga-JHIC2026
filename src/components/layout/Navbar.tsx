"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";

export interface NavbarProps {
  onOpenLogin?: () => void;
  onSelectCategory?: (category: string) => void;
}

export default function Navbar({ onOpenLogin, onSelectCategory }: NavbarProps) {
  const [activeNav, setActiveNav] = useState("Beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleDropdownEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenDropdown("jurusan");
  };

  const handleDropdownLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const navigateToSection = (id: string) => {
    if (pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    router.push(`/#${id}`);
  };

  const handleCategoryClick = (category: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (onSelectCategory) {
      onSelectCategory(category);
      navigateToSection("galeri-section");
    } else {
      const slugMap: Record<string, string> = {
        RPL: "rpl",
        TKJ: "tkj",
        "Analis Kimia": "analis-kimia",
      };
      const slug = slugMap[category] || "rpl";
      router.push(`/jurusan#${slug}`);
    }
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
<<<<<<< HEAD
    <header className="fixed top-5 left-0 right-0 mx-auto z-50 w-[94%] max-w-4xl">
      <div className="bg-white/95 border border-zinc-200/90 shadow-sm rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between backdrop-blur-md">
=======
    <header className="fixed top-5 left-0 right-0 mx-auto z-50 w-[96%] max-w-5xl lg:max-w-6xl transform-gpu will-change-transform">
      <div className="bg-white/98 border border-zinc-200/90 shadow-sm shadow-zinc-900/5 rounded-full px-5 sm:px-7 py-2.5 flex items-center justify-between">
>>>>>>> 5a61825 (feat: add JurusanNavTabs component for navigation between majors)
        {/* Left: Brand Icon & Navigation Links */}
        <div className="flex items-center gap-6 lg:gap-8">
          {/* Logo Brand Icon & Title (Minimalist & Elegant) */}
          <Link href="/" className="flex items-center gap-1.5 group shrink-0">
            <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-zinc-900/5 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Image
                src="/logo.png"
                alt="Kandaga Logo"
                fill
                className="object-contain"
                priority
              />
            </div> 
            <span className="select-none font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#a61743] bg-clip-text text-transparent group-hover:from-zinc-900 group-hover:to-[#b81d4a] transition-all duration-300 whitespace-nowrap">
              KANDAGA
            </span>
          </Link>

          {/* Desktop Nav Links with Dropdown */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs sm:text-sm font-medium text-zinc-600 whitespace-nowrap">
            {/* 0. Beranda */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("Beranda");
                if (pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  router.push("/");
                }
              }}
              className={`hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap shrink-0 ${
                pathname === "/" && activeNav === "Beranda"
                  ? "text-[#8B1A2F] font-bold"
                  : ""
              }`}
            >
              Beranda
            </button>

            {/* 1. Jurusan Kami Dropdown (Sitemap) */}
            <div
              className="relative py-1 shrink-0"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                href="/jurusan"
                className="flex items-center gap-1.5 hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap"
              >
                <span className="whitespace-nowrap">Jurusan Kami</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${
                    openDropdown === "jurusan" ? "rotate-180 text-zinc-800" : ""
                  }`}
                />
              </Link>

                <div
                  className="absolute top-full left-0 pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  {/* Dropdown Card with hover bridge before pseudo-element */}
                  <div className="bg-white/98 backdrop-blur-xl border border-zinc-200/90 rounded-2xl shadow-xl p-2 relative before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']">
                    <Link
                      href="/jurusan"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#8B1A2F] bg-[#8B1A2F]/5 hover:bg-[#8B1A2F]/10 transition cursor-pointer mb-1 border border-[#8B1A2F]/15"
                    >
                      <span>Semua Jurusan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/jurusan?tab=rpl"
                      onClick={() => setOpenDropdown(null)}
                      className="block w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                    >
                      Rekayasa Perangkat Lunak (RPL)
                    </Link>
                    <Link
                      href="/jurusan?tab=tkj"
                      onClick={() => setOpenDropdown(null)}
                      className="block w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                    >
                      Teknik Komputer Jaringan (TKJ)
                    </Link>
                    <Link
                      href="/jurusan?tab=analis-kimia"
                      onClick={() => setOpenDropdown(null)}
                      className="block w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                    >
                      Analis Kimia (4 Tahun)
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Tentang Kami */}
            <button
              type="button"
              onClick={() => navigateToSection("tentang-section")}
              className="hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap shrink-0"
            >
              Tentang Kami
            </button>

            {/* 3. Galeri Karya */}
            <button
              type="button"
              onClick={() => navigateToSection("galeri-section")}
              className="hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap shrink-0"
            >
              Galeri Karya
            </button>

            {/* 4. Kontak */}
            <button
              type="button"
              onClick={() => navigateToSection("kontak-section")}
              className="hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap shrink-0"
            >
              Kontak
            </button>
          </nav>
        </div>

        {/* Right Action: Mitra Perusahaan + Login Pill Button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => navigateToSection("industri-section")}
            className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            Mitra Perusahaan
          </button>

          <Link
            href="/login"
            onClick={(e) => {
              if (onOpenLogin) {
                e.preventDefault();
                onOpenLogin();
              }
            }}
            className="bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white px-5 sm:px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-[#891337]/25 hover:shadow-lg hover:shadow-[#891337]/35 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            Masuk
          </Link>

          {/* Mobile Hamburger toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-zinc-700 hover:text-black rounded-full cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isMobileMenuOpen && (
<<<<<<< HEAD
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-3xl p-4 shadow-xl space-y-2 transition-all duration-200">
          {["Jurusan Kami", "Tentang Kami", "Galeri Karya", "Kontak"].map(
=======
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-zinc-200/80 rounded-3xl p-4 shadow-xl space-y-2 animate-in fade-in duration-200">
          {["Beranda", "Jurusan Kami", "Tentang Kami", "Galeri Karya", "Kontak"].map(
>>>>>>> 5a61825 (feat: add JurusanNavTabs component for navigation between majors)
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setActiveNav(item);
                  setIsMobileMenuOpen(false);
                  if (item === "Beranda") {
                    if (pathname === "/") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      router.push("/");
                    }
                  } else if (item === "Jurusan Kami") {
                    router.push("/jurusan");
                  } else if (item === "Galeri Karya") {
                    navigateToSection("galeri-section");
                  } else if (item === "Tentang Kami") {
                    navigateToSection("tentang-section");
                  } else if (item === "Kontak") {
                    navigateToSection("kontak-section");
                  }
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeNav === item
                    ? "bg-gradient-to-r from-[#891337] to-[#a61743] text-white"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {item}
              </button>
            )
          )}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateToSection("industri-section");
              }}
              className="text-xs font-bold text-zinc-700 hover:text-zinc-950"
            >
              Mitra Perusahaan
            </button>
            <Link
              href="/login"
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                if (onOpenLogin) {
                  e.preventDefault();
                  onOpenLogin();
                }
              }}
              className="bg-[#90133b] text-white px-5 py-1.5 rounded-full text-xs font-bold cursor-pointer"
            >
              Masuk
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
