"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  Building2,
  BookOpen,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export interface NavbarProps {
  onOpenLogin?: () => void;
  onSelectCategory?: (category: string) => void;
}

export default function Navbar({ onOpenLogin, onSelectCategory }: NavbarProps) {
  const { data: session, status } = useSession();
  const [activeNav, setActiveNav] = useState("Beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const rawRole = (session?.user?.role || "student").toLowerCase();
  const normalizedRole =
    rawRole === "students" ? "student" : rawRole === "bkk" ? "bkk" : rawRole;

  const roleMeta: Record<
    string,
    { label: string; badgeColor: string; icon: React.ElementType }
  > = {
    student: {
      label: "Student",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      icon: GraduationCap,
    },
    admin: {
      label: "Admin",
      badgeColor: "bg-rose-900 text-white border-rose-950",
      icon: ShieldCheck,
    },
    company: {
      label: "Company",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Building2,
    },
    teacher: {
      label: "Teacher",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: BookOpen,
    },
    bkk: {
      label: "BKK",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: Briefcase,
    },
  };

  const currentRoleMeta = roleMeta[normalizedRole] || roleMeta.student;
  const RoleIcon = currentRoleMeta.icon;
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

  useEffect(() => {
    if (pathname !== "/") return;

    const sections = [
      { id: "hero", nav: "Beranda" },
      { id: "galeri-section", nav: "Galeri Karya" },
      { id: "tentang-section", nav: "Tentang Kami" },
      { id: "jurusan-section", nav: "Jurusan Kami" },
      { id: "industri-section", nav: "Mitra Perusahaan" },
      { id: "footer", nav: "Kontak" },
    ];

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 120
      ) {
        setActiveNav("Kontak");
        return;
      }

      if (window.scrollY < 300) {
        setActiveNav("Beranda");
        return;
      }

      const scrollPosition = window.scrollY + 220;
      for (let i = sections.length - 1; i >= 0; i--) {
        const item = sections[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveNav(item.nav);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

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
      router.push(`/jurusan/${slug}`);
    }
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-5 left-0 right-0 mx-auto z-50 w-[96%] max-w-5xl lg:max-w-6xl transform-gpu will-change-transform">
      <div className="bg-white/98 border border-zinc-200/90 shadow-sm shadow-zinc-900/5 rounded-full px-5 sm:px-7 py-2.5 flex items-center justify-between">
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

          {/* Desktop Nav Links with Dropdown (Ordered by section sequence on landing page) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs sm:text-sm font-medium text-zinc-600 whitespace-nowrap">
            {/* 1. Beranda */}
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
                activeNav === "Beranda" ? "text-[#8B1A2F] font-bold" : ""
              }`}
            >
              Beranda
            </button>

            {/* 2. Galeri Karya (Section muncul kedua) */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("Galeri Karya");
                navigateToSection("galeri-section");
              }}
              className={`hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap shrink-0 ${
                activeNav === "Galeri Karya" ? "text-[#8B1A2F] font-bold" : ""
              }`}
            >
              Galeri Karya
            </button>

            {/* 3. Tentang Kami (Section muncul ketiga) */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("Tentang Kami");
                navigateToSection("tentang-section");
              }}
              className={`hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap shrink-0 ${
                activeNav === "Tentang Kami" ? "text-[#8B1A2F] font-bold" : ""
              }`}
            >
              Tentang Kami
            </button>

            {/* 4. Jurusan Kami Dropdown (Section muncul keempat) */}
            <div
              className="relative py-1 shrink-0"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveNav("Jurusan Kami");
                  navigateToSection("jurusan-section");
                }}
                className={`flex items-center gap-1.5 hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap ${
                  activeNav === "Jurusan Kami" ? "text-[#8B1A2F] font-bold" : ""
                }`}
              >
                <span className="whitespace-nowrap">Jurusan Kami</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${
                    openDropdown === "jurusan" ? "rotate-180 text-zinc-800" : ""
                  }`}
                />
              </button>

              {openDropdown === "jurusan" && (
                <div
                  className="absolute top-full left-0 pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  {/* Dropdown Card with hover bridge before pseudo-element */}
                  <div className="bg-white/98 backdrop-blur-xl border border-zinc-200/90 rounded-2xl shadow-xl p-2 relative before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-[''] space-y-1">
                    <Link
                      href="/jurusan/rpl"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-[#8B1A2F]/5 hover:text-[#8B1A2F] transition cursor-pointer group"
                    >
                      <span>Rekayasa Perangkat Lunak (RPL)</span>
                      <Image
                        src="/icons/arrowright.svg"
                        alt="Arrow"
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all object-contain"
                      />
                    </Link>
                    <Link
                      href="/jurusan/tkj"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-[#8B1A2F]/5 hover:text-[#8B1A2F] transition cursor-pointer group"
                    >
                      <span>Teknik Komputer Jaringan (TKJ)</span>
                      <Image
                        src="/icons/arrowright.svg"
                        alt="Arrow"
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all object-contain"
                      />
                    </Link>
                    <Link
                      href="/jurusan/analis-kimia"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-[#8B1A2F]/5 hover:text-[#8B1A2F] transition cursor-pointer group"
                    >
                      <span>Analis Kimia (4 Tahun)</span>
                      <Image
                        src="/icons/arrowright.svg"
                        alt="Arrow"
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all object-contain"
                      />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Kontak → scroll ke #footer */}
            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                setActiveNav("Kontak");
                if (pathname !== "/") {
                  router.push("/#footer");
                  return;
                }
                document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`hover:text-zinc-950 transition cursor-pointer py-1 whitespace-nowrap shrink-0 ${
                activeNav === "Kontak" ? "text-[#8B1A2F] font-bold" : ""
              }`}
            >
              Kontak
            </a>
          </nav>
        </div>

        {/* Right Action: Mitra Perusahaan + Profile Avatar or Login Button */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setActiveNav("Mitra Perusahaan");
              navigateToSection("industri-section");
            }}
            className={`hidden md:inline-block text-xs sm:text-sm font-medium hover:text-zinc-950 transition cursor-pointer whitespace-nowrap ${
              activeNav === "Mitra Perusahaan"
                ? "text-[#8B1A2F] font-bold"
                : "text-zinc-600"
            }`}
          >
            Mitra Perusahaan
          </button>

          {status === "authenticated" && session?.user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100 transition cursor-pointer shadow-xs"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#891337] to-[#a61743] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {session.user.username
                    ? session.user.username.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-800 max-w-[100px] truncate">
                  {session.user.username || "Profile"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 bg-zinc-50 rounded-xl mb-2 border border-zinc-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {session.user.username || "Pengguna"}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${currentRoleMeta.badgeColor}`}
                      >
                        {currentRoleMeta.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <Link
                    href={`/${normalizedRole}/dashboard`}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-[#891337]/10 hover:text-[#891337] transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#891337]" />
                    <span>Portal Dashboard</span>
                  </Link>

                  <div className="my-1 border-t border-zinc-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Keluar (Sign Out)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
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
          )}

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
          {["Beranda", "Galeri Karya", "Tentang Kami", "Jurusan Kami", "Kontak"].map(
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
                  } else if (item === "Galeri Karya") {
                    navigateToSection("galeri-section");
                  } else if (item === "Tentang Kami") {
                    navigateToSection("tentang-section");
                  } else if (item === "Jurusan Kami") {
                    if (pathname === "/") {
                      navigateToSection("jurusan-section");
                    } else {
                      router.push("/jurusan/rpl");
                    }
                  } else if (item === "Kontak") {
                    if (pathname !== "/") {
                      router.push("/#footer");
                    } else {
                      document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
                    }
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
            {status === "authenticated" && session?.user ? (
              <Link
                href={`/${normalizedRole}/dashboard`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-[#90133b] text-white px-5 py-1.5 rounded-full text-xs font-bold cursor-pointer"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
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
            )}
          </div>
        </div>
      )}
    </header>
  );
}
