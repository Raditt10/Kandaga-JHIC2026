"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Loading from "@/components/ui/Loading";
import { createProject } from "@/lib/studentProjectStorage";
import type { JurusanSlug } from "@/types";
import {
  Upload,
  Globe,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Image as ImageIcon,
  ExternalLink,
  Code,
  FileText,
  Layers,
  HelpCircle,
} from "lucide-react";

const PRESET_COVERS = [
  { label: "RPL Software Preview", url: "/images/preview-rpl.jpg" },
  { label: "TKJ Network Infrastructure", url: "/images/preview-tkj.jpg" },
  { label: "Analis Kimia Lab Testing", url: "/images/preview-analis-kimia.jpg" },
  { label: "Kolaborasi Riset Industri", url: "/images/hero-kolaborasi.jpg" },
];

const SUGGESTED_TOOLS = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Python",
  "PostgreSQL",
  "Prisma",
  "MikroTik",
  "Cisco Packet Tracer",
  "Linux Debian",
  "IoT / ESP32",
  "Arduino",
  "LoRaWAN",
  "Spektrofotometri UV-Vis",
  "Titrasi Kimia",
  "Kromatografi Gas",
  "Quality Assurance",
];

export default function PostProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [major, setMajor] = useState<JurusanSlug>("rpl");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<string>("/images/preview-rpl.jpg");
  const [galleryImages, setGalleryImages] = useState<string[]>(["/images/preview-rpl.jpg"]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [description, setDescription] = useState("");
  const [solutionHighlights, setSolutionHighlights] = useState<string[]>([
    "Memecahkan kendala presensi manual dengan validasi QR terenkripsi.",
    "Mengurangi waktu antrean presensi siswa hingga di bawah 15 detik.",
  ]);
  const [newHighlight, setNewHighlight] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
  ]);
  const [customToolInput, setCustomToolInput] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [docUrl, setDocUrl] = useState("");

  // Student identifier: Farhan Maulana by default or session username
  const studentId =
    session?.user?.username && session.user.username !== "farhanm"
      ? session.user.username.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "farhan-maulana";

  // Solution highlights handlers
  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setSolutionHighlights([...solutionHighlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setSolutionHighlights(solutionHighlights.filter((_, i) => i !== idx));
  };

  // Tools handlers
  const handleToggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter((t) => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleAddCustomTool = () => {
    if (customToolInput.trim() && !selectedTools.includes(customToolInput.trim())) {
      setSelectedTools([...selectedTools, customToolInput.trim()]);
      setCustomToolInput("");
    }
  };

  // Gallery images handlers
  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Mohon lengkapi judul dan deskripsi karya.");
      return;
    }

    setIsLoading(true);

    try {
      const majorLabels: Record<JurusanSlug, string> = {
        rpl: "RPL",
        tkj: "TKJ",
        "analis-kimia": "Analis Kimia",
      };

      const newProjectData = {
        title: title.trim(),
        tagline: tagline.trim() || title.trim(),
        description: description.trim(),
        solutionHighlights,
        major,
        majorLabel: majorLabels[major],
        jurusan: major,
        jurusanLabel: majorLabels[major],
        year: Number(year),
        coverImage,
        galleryImages,
        status: "verified" as const,
        isPrivate,
        tools: selectedTools,
        studentId,
        studentName: session?.user?.username || "Farhan Maulana",
        studentAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        studentClass: "XII RPL 1",
        isStudentPrivate: false,
        links: {
          demoUrl: demoUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          docUrl: docUrl.trim() || undefined,
        },
      };

      // 1. Simpan ke local persistent storage
      const created = createProject(newProjectData);

      // 2. Kirim juga ke API endpoint
      try {
        await fetch("/api/student/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(created),
        });
      } catch {
        // Abaikan error API fallback
      }

      // 3. Arahkan ke halaman My-Projects
      router.push("/student/my-projects");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {isLoading && <Loading text="Menyimpan dan menerbitkan karya..." />}
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* ── Breadcrumb Bar ── */}
        <div className="border-b border-ink-150 bg-[#FBF9F6]">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-ink-600">
              <Link href="/" className="hover:text-ink transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <Link href="/student" className="hover:text-ink transition-colors">
                Portal Siswa
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <Link href="/student/my-projects" className="hover:text-ink transition-colors">
                Karya Saya
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <span className="font-semibold text-ink">Unggah Karya Baru</span>
            </nav>

            <Link
              href="/student/my-projects"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-black transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Batal</span>
            </Link>
          </div>
        </div>

        {/* ── Header Title ── */}
        <section className="border-b border-ink-150 bg-gradient-to-b from-[#FBF9F6] to-white pt-10 pb-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1A2F]/10 border border-[#8B1A2F]/20 text-[#8B1A2F] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FORMULIR PUBLIKASI KARYA INOVASI</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Unggah & Bagikan Karya Baru
            </h1>

            <p className="mt-3 text-sm sm:text-base text-ink-600 leading-relaxed max-w-[65ch]">
              Tampilkan inovasi tugas akhir Anda kepada guru, rekan sekolah, dan mitra industri. Karya publik akan muncul di etalase resmi Galeri SMKN 13 Bandung.
            </p>
          </div>
        </section>

        {/* ── Form Container ── */}
        <div className="mx-auto max-w-5xl px-6 py-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* ── SECTION 1: Identitas Karya ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
              <div className="border-b border-ink-150 pb-4">
                <h2 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A2F] text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Identitas & Program Keahlian</span>
                </h2>
                <p className="text-xs text-ink-600 mt-1">
                  Informasi dasar mengenai judul karya dan jurusan asal Anda.
                </p>
              </div>

              {/* Judul Karya */}
              <div>
                <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                  Judul Karya Proyek <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: EduClass — LMS & Presensi QR Cerdas"
                  className="w-full px-4 py-3 rounded-2xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                  Tagline / Ringkasan Cepat <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Satu atau dua kalimat pemikat yang merangkum solusi karya Anda"
                  className="w-full px-4 py-3 rounded-2xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
                />
              </div>

              {/* Program Keahlian & Tahun */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                    Program Keahlian (Jurusan) <span className="text-rose-600">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "rpl", label: "RPL" },
                      { id: "tkj", label: "TKJ" },
                      { id: "analis-kimia", label: "Analis Kimia" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMajor(item.id as JurusanSlug)}
                        className={`py-3 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                          major === item.id
                            ? "bg-[#8B1A2F] text-white border-[#8B1A2F] shadow-xs"
                            : "bg-white border-ink-200 text-zinc-700 hover:border-zinc-400"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={2020}
                    max={2030}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
                  />
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Visibilitas & Privasi ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
              <div className="border-b border-ink-150 pb-4">
                <h2 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A2F] text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Pengaturan Visibilitas & Privasi</span>
                </h2>
                <p className="text-xs text-ink-600 mt-1">
                  Pilih apakah karya ini dapat dilihat langsung oleh publik di etalase atau disimpan privat.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-4 ${
                    !isPrivate
                      ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-[#FBF9F6] border-ink-200 hover:bg-white"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !isPrivate ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-ink">Karya Publik</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Direkomendasikan
                      </span>
                    </div>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      Karya tampil di katalog Galeri resmi, dapat ditelusuri publik, dan dapat dipantau oleh mitra industri.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-4 ${
                    isPrivate
                      ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
                      : "bg-[#FBF9F6] border-ink-200 hover:bg-white"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPrivate ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm text-ink">Karya Privat</span>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      Karya disimpan secara privat dan hanya dapat diakses oleh Anda dan guru pembimbing.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* ── SECTION 3: Gambar Sampul & Dokumentasi ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
              <div className="border-b border-ink-150 pb-4">
                <h2 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A2F] text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>Gambar Sampul & Tangkapan Layar</span>
                </h2>
                <p className="text-xs text-ink-600 mt-1">
                  Visual sampul rasio 16:9 yang akan ditampilkan pada kartu galeri.
                </p>
              </div>

              {/* Cover Image Input */}
              <div>
                <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                  URL Gambar Sampul Utama <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://... atau pilih dari preset di bawah"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
                />

                {/* Preset Chips */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-zinc-500 font-medium">Pilihan preset SMKN 13:</span>
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                        coverImage === preset.url
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Live Preview */}
                {coverImage && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#FBF9F6] border border-ink-150">
                    <span className="block text-xs font-bold text-ink-700 mb-2">
                      Pratinjau Gambar Sampul:
                    </span>
                    <div className="relative aspect-[16/9] w-full max-w-md rounded-xl overflow-hidden border border-ink-200 shadow-xs">
                      <Image src={coverImage} alt="Pratinjau Sampul" fill className="object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Gallery Images */}
              <div className="pt-4 border-t border-ink-150">
                <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                  Gambar Galeri Tambahan (Dokumentasi / Screenshot)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="Masukkan URL foto/screenshot tambahan..."
                    className="flex-1 px-4 py-2 rounded-xl border border-ink-300 text-xs sm:text-sm outline-hidden focus:border-[#8B1A2F]"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition cursor-pointer"
                  >
                    + Tambah Foto
                  </button>
                </div>

                {/* Thumbnails of gallery images */}
                {galleryImages.length > 0 && (
                  <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-2">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-ink-200 group"
                      >
                        <Image src={img} alt={`Galeri ${idx + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition cursor-pointer"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION 4: Narasi & Deskripsi ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
              <div className="border-b border-ink-150 pb-4">
                <h2 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A2F] text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  <span>Narasi Solusi & Poin Inovasi</span>
                </h2>
                <p className="text-xs text-ink-600 mt-1">
                  Uraikan latar belakang masalah, cara kerja, dan dampak karya Anda.
                </p>
              </div>

              {/* Deskripsi Lengkap */}
              <div>
                <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                  Deskripsi Lengkap Karya <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan latar belakang, arsitektur teknis, dan hasil pengujian karya ini..."
                  className="w-full px-4 py-3 rounded-2xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition leading-relaxed"
                />
              </div>

              {/* Poin Solusi Dinamis */}
              <div>
                <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                  Poin Inovasi Utama (Solution Highlights)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="Contoh: Menggunakan sensor MQ-135 untuk pemantauan kualitas udara real-time..."
                    className="flex-1 px-4 py-2 rounded-xl border border-ink-300 text-xs sm:text-sm outline-hidden focus:border-[#8B1A2F]"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 bg-[#8B1A2F] text-white rounded-xl text-xs font-bold hover:bg-[#6B1424] transition cursor-pointer"
                  >
                    + Tambah Poin
                  </button>
                </div>

                <div className="space-y-2">
                  {solutionHighlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F6] border border-ink-150 text-xs sm:text-sm text-ink-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{hl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="p-1 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SECTION 5: Keterampilan & Teknologi (Tech Stack) ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
              <div className="border-b border-ink-150 pb-4">
                <h2 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A2F] text-white text-xs flex items-center justify-center font-bold">
                    5
                  </span>
                  <span>Teknologi, Alat, & Keterampilan</span>
                </h2>
                <p className="text-xs text-ink-600 mt-1">
                  Pilih keterampilan yang diaplikasikan dalam membangun proyek ini.
                </p>
              </div>

              {/* Tag Selector */}
              <div>
                <span className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                  Pilih dari Rekomendasi Populer
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOOLS.map((tool) => {
                    const isSelected = selectedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => handleToggleTool(tool)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          isSelected
                            ? "bg-[#8B1A2F] text-white border-[#8B1A2F] shadow-xs"
                            : "bg-[#FBF9F6] text-zinc-700 border-zinc-200 hover:bg-white"
                        }`}
                      >
                        {isSelected ? `✓ ${tool}` : `+ ${tool}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Tool Input */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                  Atau Tambahkan Alat/Teknologi Kustom
                </label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={customToolInput}
                    onChange={(e) => setCustomToolInput(e.target.value)}
                    placeholder="Contoh: TensorFlow, Grafana, Blender..."
                    className="flex-1 px-4 py-2 rounded-xl border border-ink-300 text-xs sm:text-sm outline-hidden focus:border-[#8B1A2F]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTool}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* ── SECTION 6: Tautan & Repositori ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
              <div className="border-b border-ink-150 pb-4">
                <h2 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A2F] text-white text-xs flex items-center justify-center font-bold">
                    6
                  </span>
                  <span>Tautan Demo & Repositori Proyek</span>
                </h2>
                <p className="text-xs text-ink-600 mt-1">
                  Sertakan tautan agar pengunjung dapat mencoba langsung aplikasi atau meninjau kode.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                    Tautan Live Demo (Opsional)
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://my-project.vercel.app"
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-xs sm:text-sm outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                    Tautan Repositori GitHub (Opsional)
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-xs sm:text-sm outline-hidden transition"
                  />
                </div>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
              <Link
                href="/student/my-projects"
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-ink-300 text-xs sm:text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition text-center"
              >
                Batal & Kembali
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8B1A2F] hover:bg-[#6B1424] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#8B1A2F]/25 hover:shadow-xl hover:shadow-[#8B1A2F]/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Unggah & Publikasikan Karya</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
