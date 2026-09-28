"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

export interface NavbarProps {
  onOpenLogin?: () => void;
  onSelectCategory?: (category: string) => void;
}

export default function Navbar({ onOpenLogin, onSelectCategory }: NavbarProps) {
  const [activeNav, setActiveNav] = useState("Beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategoryClick = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    scrollToSection("galeri-section");
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-5 left-0 right-0 mx-auto z-50 w-[94%] max-w-4xl transform-gpu will-change-transform">
      <div className="bg-white/98 border border-zinc-200/90 shadow-sm shadow-zinc-900/5 rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: Brand Icon & Navigation Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Logo Brand Icon & Title (Minimalist & Elegant) */}
          <Link href="/" className="flex items-center gap-1 group">
            <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-zinc-900/5 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Image
                src="/logo.png"
                alt="Kandaga Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="select-none font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#a61743] bg-clip-text text-transparent group-hover:from-zinc-900 group-hover:to-[#b81d4a] transition-all duration-300">
              Kandaga
            </span>
          </Link>

          {/* Desktop Nav Links with Dropdown */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-zinc-600">
            {/* 1. Jurusan Kami Dropdown (Sitemap) */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("jurusan")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => scrollToSection("jurusan-section")}
                className="flex items-center gap-1.5 hover:text-zinc-950 transition cursor-pointer py-1"
              >
                <span>Jurusan Kami</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {openDropdown === "jurusan" && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-zinc-100 rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("RPL")}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                  >
                    Rekayasa Perangkat Lunak
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("TKJ")}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                  >
                    Teknik Komputer Jaringan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("Analis Kimia")}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                  >
                    Analis Kimia
                  </button>
                </div>
              )}
            </div>

            {/* 2. Tentang Kami */}
            <button
              type="button"
              onClick={() => scrollToSection("tentang-section")}
              className="hover:text-zinc-950 transition cursor-pointer py-1"
            >
              Tentang Kami
            </button>

            {/* 3. Galeri Karya */}
            <button
              type="button"
              onClick={() => scrollToSection("galeri-section")}
              className="hover:text-zinc-950 transition cursor-pointer py-1"
            >
              Galeri Karya
            </button>

            {/* 4. Kontak */}
            <button
              type="button"
              onClick={() => scrollToSection("kontak-section")}
              className="hover:text-zinc-950 transition cursor-pointer py-1"
            >
              Kontak
            </button>
          </nav>
        </div>

        {/* Right Action: Mitra Perusahaan + Login Pill Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => scrollToSection("industri-section")}
            className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
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
            className="bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white px-5 sm:px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-[#891337]/25 hover:shadow-lg hover:shadow-[#891337]/35 cursor-pointer active:scale-95"
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
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-zinc-200/80 rounded-3xl p-4 shadow-xl space-y-2 animate-in fade-in duration-200">
          {["Jurusan Kami", "Tentang Kami", "Galeri Karya", "Kontak"].map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setActiveNav(item);
                  setIsMobileMenuOpen(false);
                  if (item === "Jurusan Kami") {
                    scrollToSection("jurusan-section");
                  } else if (item === "Galeri Karya") {
                    scrollToSection("galeri-section");
                  } else if (item === "Tentang Kami") {
                    scrollToSection("tentang-section");
                  } else if (item === "Kontak") {
                    scrollToSection("kontak-section");
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
                scrollToSection("industri-section");
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
