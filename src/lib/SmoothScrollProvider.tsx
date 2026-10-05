"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";

export { useLenis } from "lenis/react";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();

  // Reset scroll ke atas saat rute berubah (kecuali jika ada target anchor hash di URL)
  useEffect(() => {
    if (lenisRef.current?.lenis) {
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
          lenisRef.current.lenis.scrollTo(target as HTMLElement, { offset: -80 });
          return;
        }
      }
      lenisRef.current.lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  // Ekspos instance Lenis secara global di window.lenis untuk navigasi terprogram & inspeksi
  useEffect(() => {
    const instance = lenisRef.current?.lenis;
    if (instance) {
      (window as unknown as { lenis?: typeof instance }).lenis = instance;
    }
    return () => {
      delete (window as unknown as { lenis?: unknown }).lenis;
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.14,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        syncTouch: false,
        smoothWheel: true,
        anchors: true,
        autoRaf: true,
        respectReducedMotion: true,
        allowNestedScroll: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
