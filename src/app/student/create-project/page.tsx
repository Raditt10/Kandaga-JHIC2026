"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import Loading from "@/components/ui/Loading";
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
  Loader2,
  GraduationCap,
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

export default function CreateProjectPage() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/login");
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState<boolean>(false);

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
  const [mainFeatures, setMainFeatures] = useState<string[]>([
    "Memecahkan kendala operasional dengan otomasi sistem terverifikasi.",
    "Meningkatkan efisiensi kerja pengguna secara terukur dan aman.",
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

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Image Upload Handlers ──
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Harap pilih berkas gambar valid (PNG, JPG, WebP, SVG)");
      return;
    }

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Gagal mengunggah foto ke server");
      }

      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
        // Tambahkan juga ke gallery bila belum ada
        if (!galleryImages.includes(data.url)) {
          setGalleryImages([data.url, ...galleryImages]);
        }
      }
    } catch (err) {
      console.error("Cover upload error:", err);
      alert("Gagal mengunggah gambar sampul. Silakan coba lagi.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setIsUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            uploadedUrls.push(data.url);
          }
        }
      }

      if (uploadedUrls.length > 0) {
        setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert("Sebagian atau seluruh gambar galeri gagal diunggah.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  // Solution highlights handlers
  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setMainFeatures([...mainFeatures, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setMainFeatures(mainFeatures.filter((_, i) => i !== idx));
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

  // Gallery URL handlers
  const handleAddGalleryUrl = () => {
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
        description: description.trim(),
        mainFeatures,
        major,
        majorLabel: majorLabels[major],
        year: Number(year),
        coverImage,
        galleryImages,
        status: isPrivate ? "private" : "pending",
        isPrivate,
        tools: selectedTools,
        links: {
          demoUrl: demoUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          docUrl: docUrl.trim() || undefined,
        },
      };

      const response = await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProjectData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menyimpan karya ke database.");
      }

      router.push("/student/my-projects");
    } catch (err: any) {
      console.error("Submit project error:", err);
      alert(err.message || "Terjadi kesalahan saat menyimpan karya.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      roleTitle="Siswa"
      roleSlug="student"
      icon={GraduationCap}
      pageTitle="Unggah Karya Baru"
    >
      {isLoading && <Loading text="Menyimpan karya inovasi ke database..." />}

      {/* ── Header Welcome Section ── */}
      <section className="mb-8 rounded-3xl bg-primary text-white p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Formulir Publikasi Karya Digital</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Unggah Karya Inovasi Siswa
          </h1>

          <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
            Abadikan proyek tugas akhir, dokumentasi laboratorium, dan modul perangkat lunak Anda ke dalam peti penyimpanan Kandaga SMKN 13 Bandung.
          </p>
        </div>
      </section>

      {/* ── Form Container ── */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── BAGIAN 1: Identitas & Program Keahlian ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="border-b border-ink-150 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Identitas & Program Keahlian</span>
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Informasi dasar mengenai judul karya dan jurusan asal Anda di SMKN 13.
            </p>
          </div>

          {/* Judul Karya */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Judul Karya Proyek <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: EduClass — LMS & Presensi QR Cerdas"
              className="w-full px-4 py-3 rounded-2xl border border-ink-150 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-sans outline-hidden transition bg-white"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Ringkasan Singkat (Tagline)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Satu atau dua kalimat pemikat yang merangkum solusi karya Anda"
              className="w-full px-4 py-3 rounded-2xl border border-ink-150 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-sans outline-hidden transition bg-white"
            />
          </div>

          {/* Program Keahlian & Tahun */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
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
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-white border-ink-150 text-ink-700 hover:border-ink-300 hover:bg-cream"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Tahun Pembuatan
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2030}
                className="w-full px-4 py-3 rounded-xl border border-ink-150 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-sans outline-hidden transition bg-white"
              />
            </div>
          </div>
        </div>

        {/* ── BAGIAN 2: Pengaturan Visibilitas ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="border-b border-ink-150 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Pengaturan Visibilitas & Privasi</span>
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Tentukan apakah karya ini dapat dilihat langsung oleh publik di etalase resmi atau disimpan privat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-4 ${
                !isPrivate
                  ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-cream/40 border-ink-150 hover:bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  !isPrivate ? "bg-emerald-100 text-emerald-800" : "bg-ink-100 text-ink-500"
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
                  Tampil di etalase galeri sekolah, dapat dilihat juri, dan dapat menerima minat magang via BKK.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-4 ${
                isPrivate
                  ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
                  : "bg-cream/40 border-ink-150 hover:bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isPrivate ? "bg-amber-100 text-amber-800" : "bg-ink-100 text-ink-500"
                }`}
              >
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-ink">Karya Privat</span>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  Hanya dapat dilihat dan diuji oleh Anda dan guru pembimbing kompetensi keahlian.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── BAGIAN 3: Gambar Sampul & Upload Lokal (/public/assets/uploads/) ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="border-b border-ink-150 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Gambar Sampul & Tangkapan Layar (Upload Lokal)</span>
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Unggah foto karya langsung dari perangkat Anda. Berkas otomatis tersimpan di direktori server <code className="text-primary font-mono font-semibold">/public/assets/uploads/</code>.
            </p>
          </div>

          {/* 1. Cover Image Upload Section */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Gambar Sampul Utama (16:9) <span className="text-rose-600">*</span>
            </label>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={coverFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
            />

            {/* Upload Area / Dropzone */}
            <div className="p-5 rounded-2xl border-2 border-dashed border-ink-150 bg-cream/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-ink-150 text-primary flex items-center justify-center shrink-0 shadow-xs">
                  {isUploadingCover ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">
                    {isUploadingCover ? "Sedang Mengunggah Gambar..." : "Unggah Gambar Sampul dari Komputer"}
                  </p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Mendukung JPG, PNG, WebP hingga 10MB. Tersimpan di /public/assets/uploads/
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-heading font-semibold text-xs hover:bg-primary-dark transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Berkas Lokal</span>
              </button>
            </div>

            {/* Manual URL input or Preset chips */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-ink-600">Atau pilih preset cepat:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                        coverImage === preset.url
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-white text-ink-700 border-ink-150 hover:bg-cream"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Path atau URL berkas gambar..."
                className="w-full px-3 py-2 rounded-xl border border-ink-150 text-xs font-mono text-ink-700 bg-white"
              />
            </div>

            {/* Live Cover Preview */}
            {coverImage && (
              <div className="mt-4 p-4 rounded-2xl bg-cream/40 border border-ink-150 max-w-md">
                <span className="block text-xs font-bold text-ink-700 mb-2">
                  Pratinjau Sampul Aktif:
                </span>
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-ink-200 shadow-xs">
                  <Image src={coverImage} alt="Pratinjau Sampul" fill className="object-cover" />
                </div>
              </div>
            )}
          </div>

          {/* 2. Additional Gallery Images Upload */}
          <div className="pt-6 border-t border-ink-150">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Foto Tambahan / Tangkapan Layar Riset
            </label>

            {/* Hidden native multiple file input */}
            <input
              type="file"
              ref={galleryFileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleGalleryUpload(e.target.files);
              }}
            />

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                disabled={isUploadingGallery}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ink-150 hover:border-primary text-xs font-bold text-ink hover:text-primary transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isUploadingGallery ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-primary" />
                    <span>Unggah Berkas Tambahan (Bisa Banyak)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar..."
                  className="flex-1 px-3 py-2 rounded-xl border border-ink-150 text-xs text-ink bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-3.5 py-2 rounded-xl bg-ink text-white text-xs font-bold hover:bg-ink-700 transition cursor-pointer"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Gallery Image Thumbnails */}
            {galleryImages.length > 0 && (
              <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-ink-150 group shadow-xs"
                  >
                    <Image src={img} alt={`Galeri ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition cursor-pointer"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── BAGIAN 4: Narasi Solusi & Poin Inovasi ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="border-b border-ink-150 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              <span>Narasi Solusi & Poin Inovasi</span>
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Uraikan latar belakang masalah, cara kerja, dan poin keunggulan karya Anda.
            </p>
          </div>

          {/* Deskripsi Lengkap */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Deskripsi Lengkap Karya <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan latar belakang, arsitektur teknis, dan hasil pengujian karya ini..."
              className="w-full px-4 py-3 rounded-2xl border border-ink-150 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-sans outline-hidden transition leading-relaxed bg-white"
            />
          </div>

          {/* Poin Solusi / Highlights */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Poin Keunggulan / Fitur Utama
            </label>
            <div className="space-y-2 mb-3">
              {mainFeatures.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cream/40 border border-ink-150 text-xs sm:text-sm text-ink-800"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="text-ink-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Tambahkan poin solusi inovasi..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-ink-150 text-xs sm:text-sm outline-hidden focus:border-primary bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition cursor-pointer"
              >
                + Tambah
              </button>
            </div>
          </div>
        </div>

        {/* ── BAGIAN 5: Alat, Bahasa & Tautan Eksternal ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="border-b border-ink-150 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                5
              </span>
              <span>Teknologi, Instrumen & Tautan Proyek</span>
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Pilih instrumen laboratorium atau teknologi yang digunakan serta sematkan repositori karya.
            </p>
          </div>

          {/* Tools & Skills selection */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Teknologi / Alat Praktik yang Digunakan
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED_TOOLS.map((tool) => {
                const isSelected = selectedTools.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => handleToggleTool(tool)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-white text-ink-700 border-ink-150 hover:bg-cream"
                    }`}
                  >
                    {isSelected ? `✓ ${tool}` : `+ ${tool}`}
                  </button>
                );
              })}
            </div>

            {/* Custom tool add */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={customToolInput}
                onChange={(e) => setCustomToolInput(e.target.value)}
                placeholder="Alat/alat lab lain..."
                className="flex-1 px-3 py-2 rounded-xl border border-ink-150 text-xs text-ink bg-white outline-hidden focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddCustomTool}
                className="px-3 py-2 bg-ink text-white rounded-xl text-xs font-bold hover:bg-ink-700 transition cursor-pointer"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* External links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-ink-150">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Tautan Live Demo / Aplikasi (Opsional)
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl border border-ink-150 text-xs text-ink bg-white outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Tautan Repositori GitHub / Git (Opsional)
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2.5 rounded-xl border border-ink-150 text-xs text-ink bg-white outline-hidden focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* ── Submit Action Toolbar ── */}
        <div className="flex items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-ink-150 shadow-xs">
          <Link
            href="/student/my-projects"
            className="px-5 py-2.5 rounded-xl border border-ink-150 text-xs font-bold text-ink-700 hover:bg-cream transition"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-heading font-bold text-xs sm:text-sm hover:bg-primary-dark transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menerbitkan ke Database...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-accent" />
                <span>Simpan & Terbitkan Karya</span>
              </>
            )}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
