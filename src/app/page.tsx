"use client"
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import ScrollExpandHero from "@/components/landing/ScrollExpandHero";
import GallerySection from "@/components/landing/GallerySection";
import StatsSection from "@/components/landing/StatsSection";
import WhySection from "@/components/landing/WhySection";
import JurusanMenu from "@/components/landing/JurusanMenu";
import IndustrySection from "@/components/landing/IndustrySection";
import TrustBar from "@/components/landing/TrustBar";
import FAQSection from "@/components/landing/FAQSection";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero: curtain reveal 3 panel + magnetic CTA */}
        <Hero />

        {/* 2. ScrollExpandHero: jendela kecil → penuh layar
               KANDAGA hilang → slogan muncul */}
        <ScrollExpandHero />

        {/* 3. Galeri karya: card deck interaktif + auto-advance 7 detik */}
        <GallerySection />

        {/* 4. Statistik dark section + count-up */}
        <StatsSection />

        {/* 5. Kenapa Harus Kandaga: tilt-on-hover + SVG stroke draw */}
        <WhySection />

        {/* 6. Jelajahi per Jurusan: FlowingMenu (GSAP, lazy-loaded) */}
        <JurusanMenu />

        {/* 7. Untuk Industri & Mitra: blueprint layout + tooltip hotspot */}
        <IndustrySection />

        {/* 8. Trust bar: logo mitra */}
        <TrustBar />

        {/* 9. FAQ: accordion overshoot easing */}
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
