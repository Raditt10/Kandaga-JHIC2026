"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Check, Globe, Lock, Sparkles, Image as ImageIcon } from "lucide-react";
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
  { label: "TKJ Network Infrastructure", url: "/images/preview-tkj.jpg" },
  { label: "Analis Kimia Lab", url: "/images/preview-analis-kimia.jpg" },
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
        title,
        tagline,
        description,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-ink-150 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-150 bg-[#FBF9F6]">
          <div>
            <h2 id="modal-title" className="font-heading text-xl font-bold text-ink">
              Edit Informasi Karya
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Perbarui judul, media gambar, visibilitas publik, atau tautan proyek Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
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
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
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
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
              placeholder="Satu atau dua kalimat yang menjelaskan solusi karya"
            />
          </div>

          {/* Pengaturan Visibilitas (Publik vs Privat) */}
          <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-ink-150">
            <span className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-1">
              Visibilitas Karya
            </span>
            <p className="text-xs text-ink-600 mb-3">
              Tentukan apakah karya ini dapat dilihat di Galeri Publik atau hanya oleh Anda dan guru pembimbing.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                  !isPrivate
                    ? "bg-white border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500"
                    : "bg-white/60 border-ink-200 text-zinc-600 hover:bg-white"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    !isPrivate ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="block">Karya Publik</span>
                  <span className="text-[11px] font-normal text-zinc-500">
                    Tampil di etalase galeri sekolah
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                  isPrivate
                    ? "bg-white border-amber-500 text-amber-900 shadow-xs ring-1 ring-amber-500"
                    : "bg-white/60 border-ink-200 text-zinc-600 hover:bg-white"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isPrivate ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="block">Karya Privat</span>
                  <span className="text-[11px] font-normal text-zinc-500">
                    Hanya Anda & guru pembimbing
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Program Keahlian */}
          <div>
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Program Keahlian (Jurusan)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "rpl", label: "Rekayasa Perangkat Lunak" },
                { id: "tkj", label: "Teknik Komputer Jaringan" },
                { id: "analis-kimia", label: "Analis Kimia" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMajor(item.id as JurusanSlug)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center truncate ${
                    major === item.id
                      ? "bg-[#8B1A2F] text-white border-[#8B1A2F] shadow-xs"
                      : "bg-white border-ink-200 text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image URL & Preview */}
          <div>
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              URL Gambar Sampul (Cover Image)
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
              placeholder="https://... atau /images/preview-rpl.jpg"
            />

            {/* Quick preset chips */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-zinc-500 font-medium mr-1">Pilihan preset:</span>
              {PRESET_COVERS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                    coverImage === preset.url
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Live Preview Container */}
            {coverImage && (
              <div className="mt-3 relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-ink-200 bg-zinc-100">
                <Image
                  src={coverImage}
                  alt="Pratinjau Sampul"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Deskripsi Lengkap */}
          <div>
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Deskripsi Lengkap Karya
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition leading-relaxed"
              placeholder="Jelaskan latar belakang masalah, cara kerja sistem, serta dampak implementasi karya ini..."
            />
          </div>

          {/* Tech Stack & Tools */}
          <div>
            <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
              Teknologi & Keterampilan (Pisahkan dengan tanda koma)
            </label>
            <input
              type="text"
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
              placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS"
            />
          </div>

          {/* Tautan Proyek */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                Tautan Live Demo
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
                placeholder="https://my-app.vercel.app"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                Tautan GitHub / Repositori
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-ink-300 focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/20 text-sm font-sans outline-hidden transition"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-4 border-t border-ink-150 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-ink-200 text-xs sm:text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#8B1A2F] hover:bg-[#6B1424] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
