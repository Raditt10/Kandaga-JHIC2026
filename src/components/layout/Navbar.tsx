"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

const links = [
  { label: "Beranda", href: "/" },
  { label: "Galeri", href: "/galeri" },
  { label: "Tingkatan", href: "/tingkatan" },
  { label: "Tentang", href: "/tentang" },
  { label: "Etalase", href: "/etalase" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Scroll progress bar: garis 2px di bawah navbar, scaleX mengikuti scroll ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-primary"
        style={{ scaleX }}
        aria-hidden="true"
      />

      <motion.header
        className="sticky top-0 z-50 transition-all duration-250"
        animate={
          scrolled
            ? {
                // Floating pill: margin dari tepi, border-radius penuh
                margin: "12px 16px 0",
                borderRadius: "9999px",
                backgroundColor: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
              }
            : {
                margin: "0px 0px 0",
                borderRadius: "0px",
                backgroundColor: "rgba(255,255,255,0)",
                backdropFilter: "blur(0px)",
                boxShadow: "none",
              }
        }
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt=" "
              width={40}
              height={40}
              unoptimized
              priority
            />
          </Link>

          {/* Menu pill — desktop */}
          <ul className="hidden items-center gap-1 rounded-full border border-ink-150 bg-white/80 p-1 backdrop-blur md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </AnimatePresence>
                  <Link
                    href={link.href}
                    className={`relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? "text-white" : "text-ink-700 hover:bg-ink-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Login — ghost/outline style: fill solid hanya muncul saat hover */}
          <Link
            href="/login"
            className="rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Login
          </Link>
        </nav>

        {/* Border bawah hanya saat belum scroll (setelah scroll jadi floating, tidak perlu border) */}
        {!scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-ink-150" />
        )}
      </motion.header>
    </>
  );
}
