"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import {
  Camera,
  Upload,
  Trash2,
  Mail,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  X,
} from "lucide-react"
import { emitAvatarUpdate, onAvatarUpdate } from "@/lib/socket"
import { isCustomAvatar, getInitials } from "@/lib/avatar"
import {
  AVATAR_CACHE_BASE,
  PROFILE_CACHE_BASE,
  purgeLegacyAccountCache,
  readUserCache,
  writeUserCache,
} from "@/lib/user-cache"

// Indonesian Flag SVG Component for crisp vector rendering
function IndonesiaFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={`${className} rounded-2xs overflow-hidden shrink-0 shadow-2xs`}
      viewBox="0 0 3 2"
      aria-hidden="true"
    >
      <rect width="3" height="1" fill="#E70011" />
      <rect y="1" width="3" height="1" fill="#FFFFFF" />
    </svg>
  )
}

interface ProfileState {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: "male" | "female"
  id: string
  nisn: string
  majorName: string
  majorFullName: string
  class: string
  school: string
  country: string
  address: string
  bio: string
  photoUrl: string
}

const DEFAULT_PROFILE: ProfileState = {
  firstName: "Rafaditya",
  lastName: "Syahputra",
  email: "iniakuraditt@gmail.com",
  phone: "0812-3456-7890",
  gender: "male",
  id: "13533478",
  nisn: "0067829140",
  majorName: "RPL",
  majorFullName: "Rekayasa Perangkat Lunak",
  class: "XII RPL 1",
  school: "SMK Negeri 13 Bandung",
  country: "Indonesia",
  address: "Jl. Soekarno-Hatta No. 584, Sekejati, Kec. Buahbatu, Kota Bandung, Jawa Barat 40286",
  bio: "Siswa tingkat akhir jurusan RPL SMKN 13 Bandung dengan spesialisasi Next.js, TypeScript, dan arsitektur database relasional PostgreSQL.",
  photoUrl: "",
}

export default function StudentProfileView() {
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ProfileState>(DEFAULT_PROFILE)
  const [initialForm, setInitialForm] = useState<ProfileState>(DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load profile from API and localStorage fallback
  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      /*
       * 1. Pakai cache lokal MILIK AKUN INI untuk tampilan instan.
       *
       * Kunci versi lama (`kandaga_student_profile`) tidak memuat identitas
       * siapa pun, sehingga di peramban yang dipakai bergantian profil akun
       * sebelumnya ikut terbaca dan tampil. Sekarang kuncinya memuat id akun,
       * dan bila sesi belum siap pembacaan cache sengaja dilewati.
       */
      purgeLegacyAccountCache()

      const userId = session?.user?.id
      const cached = readUserCache<Partial<ProfileState>>(PROFILE_CACHE_BASE, userId)
      if (cached && mounted) {
        setForm((prev) => ({ ...prev, ...cached }))
        setInitialForm((prev) => ({ ...prev, ...cached }))
      }

      // 2. Fetch from backend API
      try {
        const res = await fetch("/api/student/profil")
        if (res.ok) {
          const data = await res.json()
          if (data.profile && mounted) {
            const merged: ProfileState = {
              firstName: data.profile.firstName || (session?.user?.name ? session.user.name.split(" ")[0] : DEFAULT_PROFILE.firstName),
              lastName: data.profile.lastName || (session?.user?.name ? session.user.name.split(" ").slice(1).join(" ") : DEFAULT_PROFILE.lastName),
              email: data.profile.email || session?.user?.email || DEFAULT_PROFILE.email,
              phone: data.profile.phone || DEFAULT_PROFILE.phone,
              gender: (data.profile.gender as "male" | "female") || DEFAULT_PROFILE.gender,
              id: data.profile.nis || DEFAULT_PROFILE.id,
              nisn: data.profile.nisn || DEFAULT_PROFILE.nisn,
              majorName: data.profile.majorName || DEFAULT_PROFILE.majorName,
              majorFullName: data.profile.majorFullName || DEFAULT_PROFILE.majorFullName,
              class: data.profile.class || DEFAULT_PROFILE.class,
              school: data.profile.school || DEFAULT_PROFILE.school,
              country: "Indonesia",
              address: data.profile.address || DEFAULT_PROFILE.address,
              bio: data.profile.bio || DEFAULT_PROFILE.bio,
              photoUrl: data.profile.photoUrl || DEFAULT_PROFILE.photoUrl,
            }
            setForm(merged)
            setInitialForm(merged)
            writeUserCache(PROFILE_CACHE_BASE, userId, merged)
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote student profile:", err)
      }
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [session])

  // Berlangganan event Socket.IO pembaruan avatar secara real-time
  useEffect(() => {
    const unsubscribe = onAvatarUpdate((data) => {
      if (!data.userId || data.userId === session?.user?.id) {
        setForm((prev) => ({ ...prev, photoUrl: data.photoUrl }))
        setInitialForm((prev) => ({ ...prev, photoUrl: data.photoUrl }))
      }
    })
    return unsubscribe
  }, [session?.user?.id])

  // Handle photo upload via file dialog
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe berkas
    if (!file.type.startsWith("image/")) {
      setSaveMessage({ type: "error", text: "Format berkas harus berupa gambar (JPG, PNG, atau WebP)." })
      return
    }

    // Validasi ukuran (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage({ type: "error", text: "Ukuran gambar tidak boleh melebihi 5MB." })
      return
    }

    setIsUploadingPhoto(true)
    setSaveMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const newPhotoUrl = data.url || URL.createObjectURL(file)
        setForm((prev) => ({ ...prev, photoUrl: newPhotoUrl }))
        setInitialForm((prev) => ({ ...prev, photoUrl: newPhotoUrl }))

        // 1. Simpan langsung ke database profil siswa
        try {
          await fetch("/api/student/profil", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photoUrl: newPhotoUrl }),
          })
        } catch (patchErr) {
          console.warn("Gagal simpan foto ke server:", patchErr)
        }

        // 2. Broadcast secara realtime ke Socket.IO & seluruh UI
        emitAvatarUpdate({
          userId: session?.user?.id,
          photoUrl: newPhotoUrl,
        })

        // 3. Simpan ke cache milik akun ini (lihat lib/user-cache.ts).
        const cacheUserId = session?.user?.id
        const currentCached =
          readUserCache<Record<string, unknown>>(PROFILE_CACHE_BASE, cacheUserId) ?? {}
        writeUserCache(PROFILE_CACHE_BASE, cacheUserId, {
          ...currentCached,
          ...form,
          photoUrl: newPhotoUrl,
        })
        writeUserCache(AVATAR_CACHE_BASE, cacheUserId, newPhotoUrl)

        setSaveMessage({ type: "success", text: "Foto profil berhasil diperbarui secara real-time!" })
      } else {
        // Fallback local blob preview if upload endpoint is unavailable
        const previewUrl = URL.createObjectURL(file)
        setForm((prev) => ({ ...prev, photoUrl: previewUrl }))
        emitAvatarUpdate({ userId: session?.user?.id, photoUrl: previewUrl })
        setSaveMessage({ type: "success", text: "Pratinjau foto profil diterapkan secara real-time." })
      }
    } catch {
      // Local fallback
      const previewUrl = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, photoUrl: previewUrl }))
      emitAvatarUpdate({ userId: session?.user?.id, photoUrl: previewUrl })
      setSaveMessage({ type: "success", text: "Pratinjau foto profil diterapkan." })
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Handle delete / reset avatar
  const handleDeletePhoto = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus foto profil dan kembali ke foto bawaan?")) {
      const defaultPhoto = "/images/siswa.webp"
      setForm((prev) => ({ ...prev, photoUrl: defaultPhoto }))
      setInitialForm((prev) => ({ ...prev, photoUrl: defaultPhoto }))

      // Simpan perubahan ke backend
      try {
        await fetch("/api/student/profil", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: defaultPhoto }),
        })
      } catch (err) {
        console.warn("Gagal reset foto ke server:", err)
      }

      // Broadcast real-time
      emitAvatarUpdate({
        userId: session?.user?.id,
        photoUrl: defaultPhoto,
      })

      const cacheUserId = session?.user?.id
      const currentCached =
        readUserCache<Record<string, unknown>>(PROFILE_CACHE_BASE, cacheUserId) ?? {}
      writeUserCache(PROFILE_CACHE_BASE, cacheUserId, {
        ...currentCached,
        ...form,
        photoUrl: defaultPhoto,
      })
      writeUserCache(AVATAR_CACHE_BASE, cacheUserId, defaultPhoto)

      setSaveMessage({ type: "success", text: "Foto profil dikembalikan ke foto bawaan secara real-time." })
    }
  }

  // Handle Save Changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()

      const res = await fetch("/api/student/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          fullName,
          phone: form.phone,
          class: form.class,
          bio: form.bio,
          photoUrl: form.photoUrl,
        }),
      })

      // Also save to localStorage
      writeUserCache(PROFILE_CACHE_BASE, session?.user?.id, form)
      setInitialForm(form)

      if (res.ok) {
        setSaveMessage({ type: "success", text: "Perubahan profil berhasil disimpan secara permanen." })
      } else {
        setSaveMessage({ type: "success", text: "Perubahan profil disimpan di peramban Anda." })
      }
      setIsEditing(false)
    } catch {
      writeUserCache(PROFILE_CACHE_BASE, session?.user?.id, form)
      setInitialForm(form)
      setSaveMessage({ type: "success", text: "Perubahan profil berhasil disimpan." })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle reset to initial form
  const handleResetForm = () => {
    setForm(initialForm)
    setSaveMessage(null)
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* ── Header Kartu Profil ── */}
      <div className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs">
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
          Profil saya
        </h1>
        <p className="font-sans text-xs sm:text-sm text-ink-600 mt-1 max-w-[65ch]">
          Kelola data identitas, kontak resmi WhatsApp, informasi akademik, dan foto profil Anda.
        </p>
      </div>

      {/* ── Form Utama (Layout Persis Mockup yang Diprofesionalkan & Bertema Kandaga) ── */}
      <form onSubmit={handleSaveChanges} className="bg-white rounded-3xl border border-ink-150 shadow-xs p-6 sm:p-8 space-y-8">
        
        {/* ── Section Avatar: Mode Read (Edit Profil di ujung card) vs Mode Edit (Upload Buttons) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-ink-150">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 min-w-0">
            {/* Avatar Container */}
            <div className="relative shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-rose-50/80 shadow-sm overflow-hidden bg-ink-100 flex items-center justify-center relative ${
                  isEditing ? "cursor-pointer group" : ""
                }`}
                onClick={() => {
                  if (isEditing && !isUploadingPhoto) {
                    fileInputRef.current?.click()
                  }
                }}
              >
                {form.photoUrl ? (
                  <Image
                    src={form.photoUrl}
                    alt="Foto Profil"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-bold text-ink-500 select-none">
                    {getInitials(`${form.firstName} ${form.lastName}`.trim()) || "?"}
                  </span>
                )}

                {/* Overlay hover saat mode edit */}
                {isEditing && (
                  <div className="absolute inset-0 bg-ink-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white p-1 text-center backdrop-blur-[1px]">
                    {isUploadingPhoto ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mb-0.5 text-white drop-shadow-sm" />
                        <span className="text-[10px] font-bold leading-none drop-shadow-sm">Ganti</span>
                      </>
                    )}
                  </div>
                )}

                {/* Loading spinner saat proses upload */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-ink-900/60 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* Hidden Input File */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Jika mode Edit: Tampilkan tombol Upload New & Delete avatar */}
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Unggah Foto Baru
                  </button>

                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2.5 rounded-xl bg-ink-100 hover:bg-ink-150 text-ink-700 text-xs font-semibold border border-ink-150 transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-ink-500" />
                    Hapus Foto
                  </button>
                </div>

                <p className="text-[11px] text-ink-600 leading-relaxed">
                  Format JPG, PNG, atau WebP. Disarankan rasio kotak 1:1, ukuran berkas maksimal 5MB.
                </p>
              </div>
            ) : (
              /* Jika mode Read: HANYA tampilkan nama dan email di samping avatar */
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-heading font-extrabold text-ink truncate">
                  {form.firstName} {form.lastName}
                </h2>
                <p className="text-xs text-ink-600 mt-0.5 truncate font-mono">
                  {form.email}
                </p>
              </div>
            )}
          </div>

          {/* Tombol di pinggir ujung card sebelah profil */}
          <div className="shrink-0 self-start sm:self-center">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setForm(initialForm)
                  setSaveMessage(null)
                }}
                className="px-4 py-2.5 rounded-xl border border-ink-150 bg-white hover:bg-ink-100 text-ink text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <X className="w-4 h-4 text-ink-500" />
                Batal
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profil
              </button>
            )}
          </div>
        </div>

        {/* ── 2-Column Responsive Form Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          
          {/* Row 1: Nama Depan * */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Nama Depan <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              readOnly={!isEditing}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Nama depan"
              className={`w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink font-medium transition ${
                !isEditing
                  ? "bg-ink-100/50 cursor-default focus:outline-none"
                  : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
              }`}
            />
          </div>

          {/* Row 1: Nama Belakang * */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Nama Belakang <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              readOnly={!isEditing}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Nama belakang"
              className={`w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink font-medium transition ${
                !isEditing
                  ? "bg-ink-100/50 cursor-default focus:outline-none"
                  : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
              }`}
            />
          </div>

          {/* Row 2: Alamat Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                readOnly={!isEditing}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contoh@gmail.com"
                className={`w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink font-mono pr-9 transition ${
                  !isEditing
                    ? "bg-ink-100/50 cursor-default focus:outline-none"
                    : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Row 2: Nomor Telepon * (dengan bendera & format +62) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Nomor Telepon <span className="text-rose-600">*</span>
            </label>
            <div className={`flex rounded-xl border border-ink-150 overflow-hidden transition ${
              !isEditing ? "bg-ink-100/50" : "focus-within:ring-2 focus-within:ring-primary/15 focus-within:border-primary bg-white"
            }`}>
              {/* Prefix Bendera Indonesia */}
              <div className="px-3 bg-ink-100/70 border-r border-ink-150 flex items-center gap-1.5 shrink-0 select-none">
                <IndonesiaFlag className="w-4 h-3" />
                <span className="text-xs font-bold text-ink-700 font-mono">+62</span>
              </div>
              <input
                type="text"
                required
                readOnly={!isEditing}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0812 123 7890"
                className={`w-full px-3.5 py-2.5 text-sm text-ink font-medium focus:outline-none ${
                  !isEditing ? "bg-ink-100/50 cursor-default" : "bg-white placeholder:text-ink-400"
                }`}
              />
            </div>
          </div>

          {/* Row 3: Jurusan (Kiri - Informasi Resmi) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Jurusan
            </label>
            <div className="w-full rounded-xl bg-ink-100 border border-ink-150 px-3.5 py-2.5 text-sm font-medium text-ink-700 select-none">
              {form.majorFullName && form.majorFullName !== form.majorName
                ? `${form.majorFullName} (${form.majorName})`
                : form.majorName || "Rekayasa Perangkat Lunak (RPL)"}
            </div>
          </div>

          {/* Row 3: Kelas * (Kanan - Dapat Diedit oleh Siswa) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Kelas <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              readOnly={!isEditing}
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              placeholder="Contoh: XII RPL 1"
              className={`w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink font-medium transition ${
                !isEditing
                  ? "bg-ink-100/50 cursor-default focus:outline-none"
                  : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
              }`}
            />
          </div>

          {/* Row 4: NIS (Kiri) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              NIS
            </label>
            <div className="w-full rounded-xl bg-ink-100 border border-ink-150 px-3.5 py-2.5 text-sm font-mono text-ink-700 select-none">
              {form.id}
            </div>
          </div>

          {/* Row 3: Bio saya (Kanan) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-ink">
                Bio saya
              </label>
              <span className="text-[11px] text-ink-500 font-mono">
                {form.bio.length} karakter
              </span>
            </div>
            <textarea
              rows={3}
              readOnly={!isEditing}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tuliskan ringkasan singkat profil, keahlian utama, dan sertifikasi Anda..."
              className={`w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink leading-relaxed font-medium transition ${
                !isEditing
                  ? "bg-ink-100/50 cursor-default resize-none focus:outline-none"
                  : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary resize-none"
              }`}
            />
          </div>

        </div>

        {/* ── Status Message Feedback ── */}
        {saveMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2.5 animate-in fade-in duration-150 ${
              saveMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {saveMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* ── Bottom Action Button: Save Changes (Tema Marun Kandaga) ── */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-ink-150">
          <div className="text-xs text-ink-500">
            {isDirty ? (
              <span className="text-amber-700 font-medium">Ada perubahan yang belum disimpan.</span>
            ) : (
              <span>Pastikan data yang terlampir sudah sesuai.</span>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-ink-150 bg-white hover:bg-ink-100 text-ink text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-ink-500" />
                Atur Ulang
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Perubahan
            </button>
          </div>
        )}
      </div>

      </form>
    </div>
  )
}
