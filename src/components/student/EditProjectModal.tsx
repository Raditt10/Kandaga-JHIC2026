"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Check,
  Globe,
  Lock,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
} from "lucide-react";
import type { GalleryProjectItem } from "@/data/galleryData";
import type { JurusanSlug } from "@/types";

export interface EditProjectModalProps {
  project: GalleryProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: Partial<GalleryProjectItem>) => Promise<void> | void;
}

const PRESET_COVERS = [
  { label: "RPL Software Preview", url: "/images/preview-rpl.jpg" },
  { label: "TKJ Network Infrastructure", url: "/images/preview-iot.jpg" },
  { label: "Analis Kimia Lab", url: "/images/preview-kimia.jpg" },
  { label: "Kolaborasi Riset", url: "/images/hero-kolaborasi.jpg" },
];

export default function EditProjectModal({
  project,
  isOpen,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [major, setMajor] = useState<JurusanSlug>("rpl");
  const [isPrivate, setIsPrivate] = useState(false);
  const [toolsInput, setToolsInput] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Body scroll lock & Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setTagline(project.tagline || "");
      setDescription(project.description || "");
      setCoverImage(project.coverImage || "/images/preview-rpl.jpg");
      setMajor(project.major || project.jurusan || "rpl");
      setIsPrivate(Boolean(project.isPrivate));
      setToolsInput((project.tools || []).join(", "));
      setDemoUrl(project.links?.demoUrl || "");
      setGithubUrl(project.links?.githubUrl || "");
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Harap pilih berkas gambar valid (PNG, JPG, WebP)");
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
        throw new Error("Gagal mengunggah gambar");
      }

      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedTools = toolsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const majorLabels: Record<JurusanSlug, string> = {
        rpl: "RPL",
        tkj: "TKJ",
        "analis-kimia": "Analis Kimia",
      };

      await onSave({
        title: title.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        coverImage,
        major,
        majorLabel: majorLabels[major],
        jurusan: major,
        jurusanLabel: majorLabels[major],
        isPrivate,
        tools: parsedTools,
        links: {
          ...project.links,
          demoUrl: demoUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
        },
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-ink-150 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* ── Sticky Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-ink-150 bg-[#FBF9F6] shrink-0">
          <div>
            <h2 id="modal-title" className="font-heading text-xl font-bold text-ink">
              Edit Informasi Karya
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Perbarui judul, gambar sampul, visibilitas publik, atau tautan proyek Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-ink-600 hover:text-ink hover:bg-ink-150/60 transition cursor-pointer"
            aria-label="Tutup modal edit karya"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Form Body ── */}
        <form id="edit-project-form" onSubmit={handleSubmit} data-lenis-prevent="true" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scroll-smooth">
          {/* Judul Karya */}
          <div>
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Judul Karya Proyek <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-sans outline-hidden transition"
              placeholder="Contoh: EduClass — LMS & Presensi QR Cerdas"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Tagline / Ringkasan Cepat
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-sans outline-hidden transition"
              placeholder="Satu kalimat ringkas tentang solusi karya ini"
            />
          </div>

          {/* Jurusan & Visibilitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                Program Keahlian
              </label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value as JurusanSlug)}
                className="w-full px-3 py-2.5 rounded-xl border border-ink-300 focus:border-primary text-xs sm:text-sm font-medium outline-hidden bg-white cursor-pointer"
              >
                <option value="rpl">Rekayasa Perangkat Lunak (RPL)</option>
                <option value="tkj">Teknik Komputer Jaringan (TKJ)</option>
                <option value="analis-kimia">Analis Kimia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                Status Visibilitas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isPrivate
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                      : "bg-white text-ink-600 border-ink-150 hover:bg-ink-100"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Publik</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isPrivate
                      ? "bg-amber-50 text-amber-900 border-amber-300 shadow-2xs"
                      : "bg-white text-ink-600 border-ink-150 hover:bg-ink-100"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Privat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gambar Sampul (Local Upload + Presets) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Gambar Sampul Karya
            </label>

            <div className="flex flex-col gap-3">
              {/* File upload action */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-ink-150 hover:border-primary text-xs font-bold text-ink hover:text-primary transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>Mengunggah ke /public/assets/uploads/...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>Unggah Gambar Lokal</span>
                    </>
                  )}
                </button>

                <span className="text-xs text-ink-300">atau pilih preset di bawah:</span>
              </div>

              {/* Preset Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COVERS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setCoverImage(preset.url)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                      coverImage === preset.url
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-ink-700 border-ink-150 hover:bg-ink-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Live Preview */}
              {coverImage && (
                <div className="relative aspect-[16/9] w-full max-w-xs rounded-xl overflow-hidden border border-ink-150 mt-1 shadow-2xs">
                  <Image src={coverImage} alt="Pratinjau Sampul" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Deskripsi Lengkap */}
          <div>
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Deskripsi Lengkap
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-sans outline-hidden transition leading-relaxed"
              placeholder="Ceritakan latar belakang, arsitektur, dan cara kerja karya ini..."
            />
          </div>

          {/* Tools & Tech Stack */}
          <div>
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Teknologi / Tools (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-sans outline-hidden transition"
              placeholder="Contoh: Next.js, TypeScript, Tailwind CSS, Prisma"
            />
          </div>

          {/* Tautan (GitHub & Demo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                Tautan Live Demo / Aplikasi
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://proyek-anda.com"
                className="w-full px-3 py-2 rounded-xl border border-ink-300 text-xs sm:text-sm outline-hidden focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                Tautan Repositori GitHub
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full px-3 py-2 rounded-xl border border-ink-300 text-xs sm:text-sm outline-hidden focus:border-primary"
              />
            </div>
          </div>
        </form>

        {/* ── Sticky Footer ── */}
        <div className="flex items-center justify-end gap-3 p-4 sm:px-6 border-t border-ink-150 bg-[#FBF9F6] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-ink-150 text-xs font-bold text-ink-600 hover:bg-ink-100 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="edit-project-form"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#6B1424] transition shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
