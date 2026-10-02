"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/layout/Footer";
import JurusanHero from "@/components/jurusan/JurusanHero";
import JurusanNavTabs from "@/components/jurusan/JurusanNavTabs";
import JurusanDetailSection from "@/components/jurusan/JurusanDetailSection";
import JurusanCollaboration from "@/components/jurusan/JurusanCollaboration";
import JurusanCTA from "@/components/jurusan/JurusanCTA";
import { JURUSAN_DATA } from "@/data/jurusanData";

function scrollToSectionTarget(id: string) {
  if (typeof window === "undefined") return;
  const targetId = id === "semua" ? "daftar-jurusan" : id;
  const element = document.getElementById(targetId);
  if (!element) return;

  const win = window as unknown as {
    lenis?: {
      scrollTo: (
        target: HTMLElement | string,
        options?: { offset?: number; duration?: number; immediate?: boolean }
      ) => void;
    };
  };

  if (win.lenis && typeof win.lenis.scrollTo === "function") {
    win.lenis.scrollTo(element, { offset: -85, duration: 1.0 });
    return;
  }

  const y = element.getBoundingClientRect().top + window.pageYOffset - 85;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function JurusanContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeMajor, setActiveMajor] = useState<string>("semua");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    const selected = tabParam || hash;
    if (selected && ["rpl", "tkj", "analis-kimia", "semua"].includes(selected)) {
      setActiveMajor(selected);
      const timer = setTimeout(() => scrollToSectionTarget(selected), 150);
      return () => clearTimeout(timer);
    }
  }, [tabParam]);

  useEffect(() => {
    const majorIds = ["rpl", "tkj", "analis-kimia"];
    const elements = majorIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveMajor(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSelectMajor = (id: string) => {
    setActiveMajor(id);
    scrollToSectionTarget(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar dihilangkan — JurusanNavTabs sebagai navigasi kontekstual */}
      <main className="flex-1">
        <JurusanHero onSelectMajor={handleSelectMajor} />
        <JurusanNavTabs activeId={activeMajor} onSelect={handleSelectMajor} />

        <div id="daftar-jurusan" className="scroll-mt-24">
          {JURUSAN_DATA.map((jurusan, index) => (
            <JurusanDetailSection key={jurusan.id} jurusan={jurusan} index={index} />
          ))}
        </div>

        <JurusanCollaboration />
        <JurusanCTA />
      </main>
      <Footer />
    </div>
  );
}

export default function JurusanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <JurusanContent />
    </Suspense>
  );
}
