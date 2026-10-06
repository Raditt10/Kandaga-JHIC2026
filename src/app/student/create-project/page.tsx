"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import Loading from "@/components/ui/Loading";
import type { JurusanSlug } from "@/types";
import {
  ArrowLeft,
  Upload,
  Globe,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  ExternalLink,
  Code,
  FileText,
  Layers,
  HelpCircle,
  Loader2,
  GraduationCap,
  Store,
  AlertCircle,
  Save,
} from "lucide-react";

const MAJOR_SECTION_CONFIG: Record<
  JurusanSlug,
  {
    title: string;
    description: string;
    toolsLabel: string;
    customPlaceholder: string;
    link1Label: string;
    link1Placeholder: string;
    link2Label: string;
    link2Placeholder: string;
  }
> = {
  "analis-kimia": {
    title: "Metode, Instrumen & Dokumen Riset",
    description:
      "Pilih instrumen atau metode analisis laboratorium yang digunakan serta cantumkan tautan laporan riset dan data pendukung pengujian.",
    toolsLabel: "Metode Analisis & Instrumen Laboratorium yang Digunakan",
    customPlaceholder: "Instrumen atau metode lab lain...",
    link1Label: "Tautan Laporan Riset / Jurnal Ilmiah (Opsional)",
    link1Placeholder: "https://drive.google.com/... (Google Drive / Dokumen Laporan Riset)",
    link2Label: "Tautan Data Pengujian / Dokumentasi Lab (Opsional)",
    link2Placeholder: "https://... (Google Drive / Spreadsheet data hasil uji)",
  },
  tkj: {
    title: "Perangkat Jaringan, Protokol & Tautan Proyek",
    description:
      "Pilih perangkat jaringan, sistem operasi, atau protokol yang digunakan serta sematkan tautan dokumentasi topologi atau konfigurasi.",
    toolsLabel: "Perangkat, Sistem & Protokol yang Digunakan",
    customPlaceholder: "Perangkat atau protokol jaringan lain...",
    link1Label: "Tautan Demo Topologi / Simulasi (Opsional)",
    link1Placeholder: "https://... (Video demo / packet tracer cloud)",
    link2Label: "Tautan Repositori / Dokumentasi Konfigurasi (Opsional)",
    link2Placeholder: "https://github.com/... (Dokumentasi konfigurasi / script)",
  },
  rpl: {
    title: "Teknologi, Instrumen & Tautan Proyek",
    description:
      "Pilih teknologi, framework, atau bahasa yang digunakan serta sematkan tautan live demo dan repositori proyek.",
    toolsLabel: "Teknologi / Bahasa Pemrograman yang Digunakan",
    customPlaceholder: "Pustaka, database, atau framework lain...",
    link1Label: "Tautan Live Demo / Aplikasi (Opsional)",
    link1Placeholder: "https://...",
    link2Label: "Tautan Repositori GitHub / Git (Opsional)",
    link2Placeholder: "https://github.com/...",
  },
};

const TOOLS_BY_MAJOR: Record<JurusanSlug, string[]> = {
  "analis-kimia": [
    "Spektrofotometri UV-Vis",
    "Titrasi Kimia (Volumetri)",
    "Kromatografi Gas (GC)",
    "HPLC",
    "AAS (Serapan Atom)",
    "Gravimetri",
    "Uji Mikrobiologi",
    "Refraktometer",
    "pH Meter Digital",
    "Quality Assurance (QA/QC)",
    "ISO 17025",
    "Preparasi Sampel Lab",
  ],
  tkj: [
    "MikroTik RouterOS",
    "Cisco Packet Tracer",
    "Linux Debian / Ubuntu",
    "Wireshark",
    "IoT / ESP32",
    "Arduino",
    "LoRaWAN",
    "Fiber Optic Fusion Splicer",
    "Routing OSPF/BGP",
    "Network Security / Firewall",
    "Docker / Container",
    "SNMP Monitoring",
  ],
  rpl: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Python",
    "PostgreSQL",
    "Prisma ORM",
    "Flutter",
    "RESTful API",
    "Git & GitHub",
    "Docker",
  ],
};

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

  /*
   * Mode edit draf.
   *
   * Id karya dibaca dari query string (`?edit=<id>`) di dalam efek, bukan lewat
   * `useSearchParams()`. Hook itu mewajibkan Suspense boundary pada halaman
   * yang diprerender statis, sedangkan halaman ini memang statis — membacanya
   * lewat `window` di efek menjaga status render itu tetap sama.
   */
  const [editId, setEditId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [major, setMajor] = useState<JurusanSlug>("rpl");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
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

  // Advisor State
  type AdvisorItem = { id: string; name: string; nip: string | null; majorName: string; majorFullName?: string };
  const [advisors, setAdvisors] = useState<AdvisorItem[]>([]);
  const [advisorId, setAdvisorId] = useState("");
  const [targetAdvisorId, setTargetAdvisorId] = useState<string>("");
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(true);

  // ── Mode edit draf: baca id karya dari query string ──
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    setEditId(id && id.trim() ? id.trim() : null);
  }, []);

  // ── Isi formulir dengan data draf yang akan diedit ──
  React.useEffect(() => {
    if (!editId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/student/projects/${editId}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Gagal memuat data karya.");
        if (cancelled) return;

        const p = data.project ?? {};
        setTitle(p.title ?? "");
        setTagline(p.tagline ?? (p.description ? p.description.slice(0, 110) : ""));
        setDescription(p.description ?? "");
        setMajor((p.major as JurusanSlug) ?? "rpl");
        setYear(Number(p.year) || new Date().getFullYear());
        setSelectedTools(Array.isArray(p.tools) ? p.tools : []);

        const advId = p.advisorId || p.advisor?.id || "";
        if (advId) {
          setTargetAdvisorId(advId);
          setAdvisorId(advId);
        }

        // Parsing BLUD & Highlights
        const rawHighlights: string[] = Array.isArray(p.solutionHighlights) ? p.solutionHighlights : [];
        const bludItem = rawHighlights.find((h) => typeof h === "string" && h.includes("Komersialisasi BLUD"));
        if (bludItem) {
          setIsBludReady(true);
          if (bludItem.toLowerCase().includes("jasa custom")) {
            setBludType("jasa");
          } else if (bludItem.toLowerCase().includes("jasa uji") || bludItem.toLowerCase().includes("konsultasi")) {
            setBludType("pengujian");
          } else {
            setBludType("produk");
          }
          const priceMatch = bludItem.match(/Estimasi:\s*([^)]+)/);
          if (priceMatch && priceMatch[1]) {
            setBludPrice(priceMatch[1].trim());
          }
        } else {
          setIsBludReady(false);
        }
        const cleanHighlights = rawHighlights.filter(
          (h) => typeof h === "string" && !h.includes("Komersialisasi BLUD")
        );
        if (cleanHighlights.length > 0) {
          setMainFeatures(cleanHighlights);
        }

        setCoverImage(p.coverImage ?? "");
        setGalleryImages(Array.isArray(p.galleryImages) && p.galleryImages.length > 0 ? p.galleryImages : (p.coverImage ? [p.coverImage] : []));
        setGithubUrl(p.links?.githubUrl ?? p.githubUrl ?? "");
        setDemoUrl(p.links?.demoUrl ?? p.demoUrl ?? "");
        setIsPrivate(Boolean(p.isPrivate || p.status === "private"));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Gagal memuat data karya.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  // BLUD (Teaching Factory) States
  const [isBludReady, setIsBludReady] = useState<boolean>(false);
  const [bludType, setBludType] = useState<string>("produk");
  const [bludPrice, setBludPrice] = useState<string>("");
  const [bludNotes, setBludNotes] = useState<string>("");

  React.useEffect(() => {
    let cancelled = false;
    setIsLoadingAdvisors(true);
    fetch(`/api/student/advisors?major=${major}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (cancelled) return;
        const list: AdvisorItem[] = data.advisors ?? [];
        setAdvisors(list);
        if (list.length > 0) {
          setAdvisorId((prev) => {
            const preferred = targetAdvisorId || prev;
            if (preferred && list.some((a) => a.id === preferred)) {
              return preferred;
            }
            return list[0].id;
          });
        } else {
          setAdvisorId("");
        }
      })
      .catch((err) => {
        console.error("Failed to load advisors:", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAdvisors(false);
      });
    return () => {
      cancelled = true;
    };
  }, [major, targetAdvisorId]);

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Jurusan Change Handler ──
  const handleMajorChange = (newMajor: JurusanSlug) => {
    setMajor(newMajor);
    const defaultTools = TOOLS_BY_MAJOR[newMajor] || [];
    setSelectedTools(defaultTools.slice(0, 3));
  };

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
        setGalleryImages([data.url]);
      }
    } catch (err) {
      console.error("Cover upload error:", err);
      alert("Gagal mengunggah gambar sampul. Silakan coba lagi.");
    } finally {
      setIsUploadingCover(false);
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Mohon lengkapi judul dan deskripsi karya.");
      return;
    }

    if (!isPrivate && !coverImage) {
      alert("Mohon pilih dan unggah berkas thumbnail karya terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      const majorLabels: Record<JurusanSlug, string> = {
        rpl: "RPL",
        tkj: "TKJ",
        "analis-kimia": "Analis Kimia",
      };

      const bludFeatures = isBludReady
        ? [
            `Tersedia Komersialisasi BLUD (${
              bludType === "produk"
                ? "Produk Jadi / Lisensi"
                : bludType === "jasa"
                ? "Jasa Custom Order"
                : "Jasa Uji / Konsultasi"
            }${bludPrice.trim() ? ` — Estimasi: ${bludPrice.trim()}` : ""})`,
          ]
        : [];

      const fallbackCover =
        major === "analis-kimia"
          ? "/images/preview-kimia.jpg"
          : major === "tkj"
          ? "/images/preview-iot.jpg"
          : "/images/preview-rpl.jpg";

      const finalCover = coverImage || fallbackCover;

      const newProjectData = {
        title: title.trim(),
        description: description.trim(),
        mainFeatures: [...mainFeatures, ...bludFeatures],
        major,
        majorLabel: majorLabels[major],
        year: Number(year),
        coverImage: finalCover,
        galleryImages: coverImage ? [coverImage] : [fallbackCover],
        status: isPrivate ? "private" : "pending",
        isPrivate,
        tools: selectedTools,
        githubUrl: githubUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        ...(advisorId ? { advisorId } : {}),
        links: {
          demoUrl: demoUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          docUrl: docUrl.trim() || undefined,
        },
      };

      /*
       * Mode edit memakai PUT, yang menerima seluruh kolom yang dapat diubah siswa.
       */
      const payload = editId
        ? {
            title: newProjectData.title,
            description: newProjectData.description,
            mainFeatures: newProjectData.mainFeatures,
            major,
            year: newProjectData.year,
            coverImage: finalCover,
            galleryImages: newProjectData.galleryImages,
            tools: selectedTools,
            githubUrl: githubUrl.trim(),
            demoUrl: demoUrl.trim(),
            isPrivate,
            advisorId: advisorId || null,
          }
        : newProjectData;

      const response = await fetch(
        editId ? `/api/student/projects/${editId}` : "/api/student/projects",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menyimpan karya ke database.");
      }

      // Setelah menyimpan perubahan, kembali ke halaman detailnya supaya hasil
      // perubahannya langsung terlihat (halaman itu memuat ulang dari API).
      router.push(
        editId ? `/student/my-projects/${editId}` : "/student?tab=karya-saya&uploaded=true"
      );
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
      activeTab="karya-saya"
      breadcrumbLabel="Karya Saya"
      breadcrumbHref="/student?tab=karya-saya"
      pageTitle={editId ? (isPrivate ? "Edit Draf Karya" : "Edit Karya") : "Unggah Karya Baru"}
    >
      {isLoading && (
        <Loading
          text={
            editId
              ? "Menyimpan perubahan karya..."
              : "Menyimpan karya inovasi ke database..."
          }
        />
      )}

      {/* ── Page Header & Tombol Kembali ── */}
      <div className="mb-6 flex items-center gap-3.5">
        <Link
          href="/student?tab=karya-saya"
          className="p-2.5 rounded-xl border border-ink-150 hover:bg-ink-100 text-ink-600 hover:text-ink transition inline-flex items-center justify-center cursor-pointer bg-white shadow-xs shrink-0"
          title="Kembali ke Daftar Karya"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
            {editId ? (isPrivate ? "Edit Draf Karya" : "Edit Karya") : "Unggah Karya Baru"}
          </h1>
          <p className="text-xs text-ink-600 mt-1">
            {editId
              ? "Perbarui isi dan data karya portofolio Anda. Klik simpan untuk menerapkan seluruh perubahan."
              : "Lengkapi formulir proyek portofolio Anda untuk diajukan ke kurasi guru pembimbing."}
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold">Draf karya gagal dimuat</p>
            <p className="mt-0.5">{loadError}</p>
          </div>
        </div>
      )}

      {/* ── Form Container ── */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── BAGIAN 1: Identitas & Program Keahlian ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-6">
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
            <label className="block text-xs font-bold text-ink mb-2">
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
            <label className="block text-xs font-bold text-ink mb-2">
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
              <label className="block text-xs font-bold text-ink mb-2">
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
                    onClick={() => handleMajorChange(item.id as JurusanSlug)}
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
              <label className="block text-xs font-bold text-ink mb-2">
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

          {/* Guru Pembimbing */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">
              Guru Pembimbing Kurasi <span className="text-rose-600">*</span>
            </label>
            {isLoadingAdvisors ? (
              <div className="w-full px-4 py-3 rounded-xl border border-ink-150 bg-ink-100 text-ink-400 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memuat daftar guru pembimbing...</span>
              </div>
            ) : advisors.length === 0 ? (
              <div className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                Tidak ada guru pembimbing yang terdaftar untuk jurusan ini saat ini.
              </div>
            ) : (
              <select
                required
                value={advisorId}
                onChange={(e) => setAdvisorId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-ink-150 focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-sans outline-hidden transition bg-white"
              >
                <option value="">-- Pilih Guru Pembimbing --</option>
                {advisors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.nip ? `(NIP: ${a.nip})` : ""} — {a.majorName}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-ink-400 mt-1.5">
              Guru yang dipilih akan menerima draf karya Anda di antrean verifikasi untuk ditinjau kelayakannya.
            </p>
          </div>
        </div>

        {/* ── BAGIAN 2: Pengaturan Visibilitas ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-6 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-4 min-h-[160px] ${
                !isPrivate
                  ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-cream/40 border-ink-150 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    !isPrivate ? "bg-emerald-100 text-emerald-800" : "bg-ink-100 text-ink-600"
                  }`}
                >
                  <Globe className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Direkomendasikan
                </span>
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-ink block">Karya Publik</span>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  Tampil di etalase galeri sekolah, dapat dilihat juri, dan dapat menerima minat magang via BKK.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-6 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-4 min-h-[160px] ${
                isPrivate
                  ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
                  : "bg-cream/40 border-ink-150 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isPrivate ? "bg-amber-100 text-amber-800" : "bg-ink-100 text-ink-600"
                  }`}
                >
                  <Lock className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Internal
                </span>
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-ink block">Karya Privat</span>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  Hanya dapat dilihat dan diuji oleh Anda dan guru pembimbing kompetensi keahlian.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── BAGIAN 3: Komersialisasi BLUD (Teaching Factory) ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="border-b border-ink-150 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Komersialisasi & Layanan BLUD</span>
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Tentukan apakah karya inovasi ini bersedia diperjualbelikan atau dipasarkan melalui unit bisnis Badan Layanan Umum Daerah (BLUD) & Teaching Factory SMKN 13.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Opsi 1: Tidak Diperjualbelikan */}
            <button
              type="button"
              onClick={() => setIsBludReady(false)}
              className={`p-6 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-4 min-h-[160px] ${
                !isBludReady
                  ? "bg-white border-primary shadow-md ring-2 ring-primary/20"
                  : "bg-cream/40 border-ink-150 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    !isBludReady ? "bg-primary/10 text-primary" : "bg-ink-100 text-ink-600"
                  }`}
                >
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-ink-100 text-ink-700 text-[10px] font-bold">
                  Akademik
                </span>
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-ink block">Tidak Diperjualbelikan</span>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  Khusus portofolio akademik, uji kompetensi kelulusan, dan dokumentasi riset sekolah (non-komersial).
                </p>
              </div>
            </button>

            {/* Opsi 2: Siap Diperjualbelikan BLUD */}
            <button
              type="button"
              onClick={() => setIsBludReady(true)}
              className={`p-6 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-4 min-h-[160px] ${
                isBludReady
                  ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-cream/40 border-ink-150 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isBludReady ? "bg-emerald-100 text-emerald-800" : "bg-ink-100 text-ink-600"
                  }`}
                >
                  <Store className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  BLUD SMKN 13
                </span>
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-ink block">Siap Diperjualbelikan</span>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  Karya bersedia ditawarkan, diproduksi, atau dilisensikan kepada mitra industri via unit bisnis BLUD.
                </p>
              </div>
            </button>
          </div>

          {/* Form Detail Tambahan Jika Siap BLUD */}
          {isBludReady && (
            <div className="p-5 rounded-2xl bg-cream/40 border border-ink-150 space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-2">
                  Bentuk Penawaran Komersial BLUD <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "produk", label: "Produk Jadi / Lisensi", desc: "Barang fisik atau aplikasi siap pakai" },
                    { id: "jasa", label: "Jasa Custom Order", desc: "Pengerjaan pesanan kustom industri" },
                    { id: "pengujian", label: "Jasa Uji / Konsultasi", desc: "Analisis lab atau setup teknis" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBludType(item.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        bludType === item.id
                          ? "bg-white border-primary shadow-xs ring-1 ring-primary/20"
                          : "bg-white/70 border-ink-150 hover:bg-white"
                      }`}
                    >
                      <p className="text-xs font-bold text-ink">{item.label}</p>
                      <p className="text-[11px] text-ink-500 mt-0.5 leading-tight">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-2">
                    Estimasi Nilai / Tarif Penawaran (Opsional)
                  </label>
                  <input
                    type="text"
                    value={bludPrice}
                    onChange={(e) => setBludPrice(e.target.value)}
                    placeholder="Contoh: Mulai Rp 1.500.000 atau Sesuai Negosiasi"
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-150 text-xs text-ink bg-white outline-hidden focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-2">
                    Catatan Kesiapan Produksi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={bludNotes}
                    onChange={(e) => setBludNotes(e.target.value)}
                    placeholder="Contoh: Memerlukan waktu 2 minggu, bahan dari pemesan"
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-150 text-xs text-ink bg-white outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <p className="text-[11px] text-ink-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Karya yang ditandai siap BLUD akan dikurasi oleh tim Teaching Factory & pengelola unit usaha sekolah.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* ── BAGIAN 4: Thumbnail Karya (Hanya muncul jika Karya Publik) ── */}
        {!isPrivate && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-6">
            <div className="border-b border-ink-150 pb-4">
              <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <span>Thumbnail Karya</span>
              </h2>
            </div>

            {/* Cover Image Upload Section */}
            <div>
              <label className="block text-xs font-bold text-ink mb-2">
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

              {/* Upload Area / Dropzone Persegi */}
              <div className="p-8 rounded-2xl border-2 border-dashed border-ink-200 bg-cream/20 hover:bg-cream/40 transition flex flex-col items-center justify-center text-center gap-3.5 max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-white border border-ink-150 text-primary flex items-center justify-center shadow-xs shrink-0">
                  {isUploadingCover ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">
                    {isUploadingCover ? "Sedang Mengunggah Gambar..." : "Unggah Thumbnail dari Perangkat"}
                  </p>
                  <p className="text-xs text-ink-500 mt-1">
                    Mendukung JPG, PNG, WebP (Maksimal 10MB)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-heading font-semibold text-xs hover:bg-primary-dark transition cursor-pointer shadow-xs disabled:opacity-50 mt-1"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih Thumbnail</span>
                </button>
              </div>

              {/* Live Cover Preview (hanya muncul setelah berkas diunggah) */}
              {coverImage && (
                <div className="mt-4 p-4 rounded-2xl bg-cream/40 border border-ink-150 max-w-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-ink-700">
                      Pratinjau Thumbnail Terpilih:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage("");
                        setGalleryImages([]);
                        if (coverFileInputRef.current) coverFileInputRef.current.value = "";
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-ink-150 shadow-xs">
                    <Image src={coverImage} alt="Pratinjau Thumbnail" fill className="object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BAGIAN: Narasi Solusi & Poin Inovasi ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="border-b border-ink-150 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                {!isPrivate ? 5 : 4}
              </span>
              <span>Narasi Solusi & Poin Inovasi</span>
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Uraikan latar belakang masalah, cara kerja, dan poin keunggulan karya Anda.
            </p>
          </div>

          {/* Deskripsi Lengkap */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">
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
            <label className="block text-xs font-bold text-ink mb-2">
              Poin Keunggulan / Fitur Utama
            </label>
            <div className="space-y-2 mb-3">
              {mainFeatures.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cream/40 border border-ink-150 text-xs sm:text-sm text-ink-700"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="text-ink-300 hover:text-rose-600 transition"
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

        {/* ── BAGIAN: Alat, Bahasa & Tautan Eksternal (Adaptif Jurusan) ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="border-b border-ink-150 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                {!isPrivate ? 6 : 5}
              </span>
              <span>{MAJOR_SECTION_CONFIG[major]?.title || "Teknologi, Instrumen & Tautan Proyek"}</span>
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              {MAJOR_SECTION_CONFIG[major]?.description ||
                "Pilih instrumen atau teknologi yang digunakan serta sematkan tautan proyek."}
            </p>
          </div>

          {/* Tools & Skills selection */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">
              {MAJOR_SECTION_CONFIG[major]?.toolsLabel || "Teknologi / Alat Praktik yang Digunakan"}
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {(TOOLS_BY_MAJOR[major] || []).map((tool) => {
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
                placeholder={MAJOR_SECTION_CONFIG[major]?.customPlaceholder || "Alat/metode lain..."}
                className="flex-1 px-3 py-2 rounded-xl border border-ink-150 text-xs text-ink bg-white outline-hidden focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTool();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTool}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition cursor-pointer shadow-xs shrink-0"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* External links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-ink-150">
            <div>
              <label className="block text-xs font-bold text-ink mb-2">
                {MAJOR_SECTION_CONFIG[major]?.link1Label || "Tautan Live Demo / Aplikasi (Opsional)"}
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder={MAJOR_SECTION_CONFIG[major]?.link1Placeholder || "https://..."}
                className="w-full px-3 py-2.5 rounded-xl border border-ink-150 text-xs text-ink bg-white outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-2">
                {MAJOR_SECTION_CONFIG[major]?.link2Label || "Tautan Repositori GitHub / Git (Opsional)"}
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder={MAJOR_SECTION_CONFIG[major]?.link2Placeholder || "https://github.com/..."}
                className="w-full px-3 py-2.5 rounded-xl border border-ink-150 text-xs text-ink bg-white outline-hidden focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* ── Submit Action Toolbar ── */}
        <div className="flex flex-col items-center justify-center gap-2.5 p-6 rounded-2xl bg-white border border-ink-150 shadow-xs text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-heading font-bold text-xs sm:text-sm hover:bg-primary-dark transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{editId ? "Menyimpan Perubahan..." : "Menerbitkan ke Database..."}</span>
              </>
            ) : editId ? (
              <>
                <Save className="w-4 h-4 text-accent" />
                <span>{isPrivate ? "Simpan Perubahan Draf" : "Simpan Perubahan Karya"}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-accent" />
                <span>Simpan & Terbitkan Karya</span>
              </>
            )}
          </button>
          <p className="text-xs text-ink-500">
            {editId
              ? "Perubahan langsung diperbarui pada karya ini."
              : "Pastikan semua data sudah lengkap"}
          </p>
        </div>
      </form>
    </DashboardLayout>
  );
}
