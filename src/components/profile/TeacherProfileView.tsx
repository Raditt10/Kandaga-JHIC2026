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
  User,
  X,
  GraduationCap,
} from "lucide-react"
import { emitAvatarUpdate, onAvatarUpdate } from "@/lib/socket"
import {
  AVATAR_CACHE_BASE,
  readUserCache,
  writeUserCache,
} from "@/lib/user-cache"

export const TEACHER_PROFILE_CACHE_BASE = "kandaga_teacher_profile"

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

interface TeacherProfileState {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: "male" | "female"
  nip: string
  majorName: string
  majorFullName: string
  school: string
  country: string
  address: string
  bio: string
  photoUrl: string
}

const DEFAULT_TEACHER_PROFILE: TeacherProfileState = {
  firstName: "Ahmad",
  lastName: "Hidayat",
  email: "guru.pembimbing@smkn13bdg.sch.id",
  phone: "0812-3456-7890",
  gender: "male",
  nip: "198205122008011005",
  majorName: "RPL",
  majorFullName: "Rekayasa Perangkat Lunak",
  school: "SMK Negeri 13 Bandung",
  country: "Indonesia",
  address: "Jl. Soekarno-Hatta No. 584, Sekejati, Kec. Buahbatu, Kota Bandung, Jawa Barat 40286",
  bio: "Guru pembimbing tugas akhir dan kurator portofolio riset laboratorium SMKN 13 Bandung dengan spesialisasi rekayasa perangkat lunak dan arsitektur database.",
  photoUrl: "/images/guru.webp",
}

export default function TeacherProfileView() {
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<TeacherProfileState>(DEFAULT_TEACHER_PROFILE)
  const [initialForm, setInitialForm] = useState<TeacherProfileState>(DEFAULT_TEACHER_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load profile from API and localStorage per-user cache
  useEffect(() => {
    let mounted = true
    const userId = session?.user?.id

    const cached = readUserCache<TeacherProfileState>(TEACHER_PROFILE_CACHE_BASE, userId)
    if (cached && mounted) {
      setForm((prev) => ({ ...prev, ...cached }))
      setInitialForm((prev) => ({ ...prev, ...cached }))
    }

    const loadRemote = async () => {
      try {
        const res = await fetch("/api/teacher/profil")
        if (res.ok) {
          const data = await res.json()
          if (data.profile && mounted) {
            const merged: TeacherProfileState = {
              firstName: data.profile.firstName || (session?.user?.name ? session.user.name.split(" ")[0] : DEFAULT_TEACHER_PROFILE.firstName),
              lastName: data.profile.lastName || (session?.user?.name ? session.user.name.split(" ").slice(1).join(" ") : DEFAULT_TEACHER_PROFILE.lastName),
              email: data.profile.email || session?.user?.email || DEFAULT_TEACHER_PROFILE.email,
              phone: data.profile.phone || DEFAULT_TEACHER_PROFILE.phone,
              gender: (data.profile.gender as "male" | "female") || DEFAULT_TEACHER_PROFILE.gender,
              nip: data.profile.nip || DEFAULT_TEACHER_PROFILE.nip,
              majorName: data.profile.majorName || DEFAULT_TEACHER_PROFILE.majorName,
              majorFullName: data.profile.majorFullName || DEFAULT_TEACHER_PROFILE.majorFullName,
              school: data.profile.school || DEFAULT_TEACHER_PROFILE.school,
              country: "Indonesia",
              address: data.profile.address || DEFAULT_TEACHER_PROFILE.address,
              bio: data.profile.bio || DEFAULT_TEACHER_PROFILE.bio,
              photoUrl: data.profile.photoUrl || DEFAULT_TEACHER_PROFILE.photoUrl,
            }
            setForm(merged)
            setInitialForm(merged)
            writeUserCache(TEACHER_PROFILE_CACHE_BASE, userId, merged)
            if (merged.photoUrl) {
              writeUserCache(AVATAR_CACHE_BASE, userId, merged.photoUrl)
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote teacher profile:", err)
      }
    }

    loadRemote()
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

    if (!file.type.startsWith("image/")) {
      setSaveMessage({ type: "error", text: "Format berkas harus berupa gambar (JPG, PNG, atau WebP)." })
      return
    }

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

        try {
          await fetch("/api/teacher/profil", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photoUrl: newPhotoUrl }),
          })
        } catch (patchErr) {
          console.warn("Gagal simpan foto guru ke server:", patchErr)
        }

        emitAvatarUpdate({
          userId: session?.user?.id,
          photoUrl: newPhotoUrl,
        })

        const cacheUserId = session?.user?.id
        const currentCached =
          readUserCache<Record<string, unknown>>(TEACHER_PROFILE_CACHE_BASE, cacheUserId) ?? {}
        writeUserCache(TEACHER_PROFILE_CACHE_BASE, cacheUserId, {
          ...currentCached,
          ...form,
          photoUrl: newPhotoUrl,
        })
        writeUserCache(AVATAR_CACHE_BASE, cacheUserId, newPhotoUrl)

        setSaveMessage({ type: "success", text: "Foto profil guru berhasil diperbarui secara real-time!" })
      }
    } catch {
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
      const defaultPhoto = "/images/guru.webp"
      setForm((prev) => ({ ...prev, photoUrl: defaultPhoto }))
      setInitialForm((prev) => ({ ...prev, photoUrl: defaultPhoto }))

      try {
        await fetch("/api/teacher/profil", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: defaultPhoto }),
        })
      } catch (err) {
        console.warn("Gagal reset foto ke server:", err)
      }

      emitAvatarUpdate({
        userId: session?.user?.id,
        photoUrl: defaultPhoto,
      })

      const cacheUserId = session?.user?.id
      const currentCached =
        readUserCache<Record<string, unknown>>(TEACHER_PROFILE_CACHE_BASE, cacheUserId) ?? {}
      writeUserCache(TEACHER_PROFILE_CACHE_BASE, cacheUserId, {
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

      const res = await fetch("/api/teacher/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          fullName,
          phone: form.phone,
          nip: form.nip,
          address: form.address,
          bio: form.bio,
          photoUrl: form.photoUrl,
        }),
      })

      writeUserCache(TEACHER_PROFILE_CACHE_BASE, session?.user?.id, form)
      setInitialForm(form)

      if (res.ok) {
        setSaveMessage({ type: "success", text: "Perubahan profil guru berhasil disimpan secara permanen." })
      } else {
        setSaveMessage({ type: "success", text: "Perubahan profil disimpan di peramban Anda." })
      }
      setIsEditing(false)
    } catch {
      writeUserCache(TEACHER_PROFILE_CACHE_BASE, session?.user?.id, form)
      setInitialForm(form)
      setSaveMessage({ type: "success", text: "Perubahan profil berhasil disimpan." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* ── Header Kartu Profil ── */}
      <div className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs">
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
          Profil saya
        </h1>
        <p className="font-sans text-xs sm:text-sm text-ink-600 mt-1 max-w-[65ch]">
          Kelola data identitas pengajar, kontak resmi WhatsApp, program keahlian diampu, dan foto profil Anda.
        </p>
      </div>

      {/* ── Form Utama ── */}
      <form onSubmit={handleSaveChanges} className="bg-white rounded-3xl border border-ink-150 shadow-xs p-6 sm:p-8 space-y-8">
        
        {/* ── Section Avatar ── */}
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
                    alt="Foto Profil Guru"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="w-12 h-12 text-ink-400" />
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

            {/* Mode Edit: Tombol Upload New & Delete avatar */}
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
              /* Mode Read: Tampilkan nama dan email di samping avatar */
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

          {/* Tombol Aksi di pinggir kartu */}
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
          
          {/* Row 1: Nama Depan */}
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

          {/* Row 1: Nama Belakang */}
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
                readOnly
                value={form.email}
                className="w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink font-mono pr-9 bg-ink-100/50 cursor-default focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Row 2: Nomor Telepon / WhatsApp */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Nomor Telepon / WhatsApp <span className="text-rose-600">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none">
                <IndonesiaFlag className="w-4 h-3" />
                <span className="text-xs font-bold text-ink-600 font-mono">+62</span>
              </div>
              <input
                type="tel"
                required
                readOnly={!isEditing}
                value={form.phone.replace(/^\+?62/, "").trim()}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9-]/g, "")
                  setForm({ ...form, phone: `+62 ${cleaned}` })
                }}
                placeholder="812-3456-7890"
                className={`w-full rounded-xl border border-ink-150 pl-16 pr-3.5 py-2.5 text-sm text-ink font-mono transition ${
                  !isEditing
                    ? "bg-ink-100/50 cursor-default focus:outline-none"
                    : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                }`}
              />
            </div>
          </div>

          {/* Row 3: NIP Guru */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              NIP (Nomor Induk Pegawai)
            </label>
            <input
              type="text"
              readOnly={!isEditing}
              value={form.nip}
              onChange={(e) => setForm({ ...form, nip: e.target.value })}
              placeholder="198205122008011005"
              className={`w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink font-mono transition ${
                !isEditing
                  ? "bg-ink-100/50 cursor-default focus:outline-none"
                  : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
              }`}
            />
          </div>

          {/* Row 3: Program Keahlian / Jurusan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              Program Keahlian / Jurusan Diampu
            </label>
            <input
              type="text"
              readOnly
              value={`${form.majorName} — ${form.majorFullName}`}
              className="w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink bg-ink-100/50 cursor-default focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Row 5: Alamat Lengkap */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-ink">
            Alamat Sekolah / Instansi
          </label>
          <input
            type="text"
            readOnly={!isEditing}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Alamat instansi"
            className={`w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink font-medium transition ${
              !isEditing
                ? "bg-ink-100/50 cursor-default focus:outline-none"
                : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
            }`}
          />
        </div>

        {/* Row 6: Bio / Pengalaman Mengajar */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-ink">
            Bio & Fokus Pembimbingan
          </label>
          <textarea
            rows={3}
            readOnly={!isEditing}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tuliskan fokus pembimbingan riset atau kurasi karya..."
            className={`w-full rounded-xl border border-ink-150 p-3.5 text-sm text-ink font-medium transition resize-none ${
              !isEditing
                ? "bg-ink-100/50 cursor-default focus:outline-none"
                : "bg-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
            }`}
          />
        </div>

        {/* Feedback Pesan Simpan */}
        {saveMessage && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
              saveMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
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

        {/* Action Buttons saat mode edit */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-150">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
