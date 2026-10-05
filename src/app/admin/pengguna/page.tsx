"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  CheckCircle2,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Shield,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserX,
  RefreshCw,
  GraduationCap,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import { EmptyState } from "@/components/ui/EmptyState"

// ─── Tipe data dari /api/admin/users ────────────────────────────────────────

type ApiUser = {
  id: string
  name: string
  email: string
  role: string
  roleLabel: string
  status: string
  createdAt: string
  majorId: string | null
  major: string | null
  majorFullName: string | null
  nis: string | null
  kelas: string | null
  generation: number | null
  nip: string | null
  companyName: string | null
  companyField: string | null
  verificationStatus: string | null
  verifiedAt: string | null
}

export type MajorOption = {
  id: string
  name: string
  fullName: string
}

type ApiResponse = {
  items: ApiUser[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  counts: Record<string, number>
  majors?: MajorOption[]
}

// ─── Konstanta tampilan ──────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  company: "Company",
  bkk: "BKK",
  admin: "Admin",
}

const STATUS_COLORS: Record<string, string> = {
  aktif: "text-emerald-600",
  nonaktif: "text-rose-500",
  pending: "text-amber-600",
}

const PAGE_SIZE = 15

export default function AdminPenggunaPage() {
  // ── Data & Loading ─────────────────────────────────────────────────────────
  const [users, setUsers] = useState<ApiUser[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({ all: 0 })
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [majorsList, setMajorsList] = useState<MajorOption[]>([])

  // ── Filters & Pagination ───────────────────────────────────────────────────
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)

  // ── Modal Edit State ───────────────────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [formRole, setFormRole] = useState("")
  const [formStatus, setFormStatus] = useState("")
  const [formMajorId, setFormMajorId] = useState("")
  const [formNip, setFormNip] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState("")

  // ── Modal Deactivate State ─────────────────────────────────────────────────
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [deactivatingUser, setDeactivatingUser] = useState<ApiUser | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Debounce search input (300ms) ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // ── Fetch users dari API ───────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const params = new URLSearchParams({
        role: roleFilter,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      })
      if (debouncedSearch) params.set("q", debouncedSearch)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      const data: ApiResponse = await res.json()
      setUsers(data.items)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setCounts(data.counts)
      if (data.majors && data.majors.length > 0) {
        setMajorsList(data.majors)
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Gagal memuat data pengguna.")
    } finally {
      setIsLoading(false)
    }
  }, [roleFilter, page, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Fetch daftar jurusan jika belum tersedia
  useEffect(() => {
    fetch("/api/majors")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMajorsList(data)
        }
      })
      .catch(() => {})
  }, [])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [roleFilter])

  // ── ESC to close modals ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditModalOpen) handleCloseEdit()
        if (isDeactivateModalOpen) handleCloseDeactivate()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isEditModalOpen, isDeactivateModalOpen])

  // ── Edit Modal ─────────────────────────────────────────────────────────────
  const handleOpenEdit = (user: ApiUser) => {
    setEditingUser(user)
    setFormRole(user.role)
    setFormStatus(user.status)
    setFormNip(user.nip || "")

    // Pre-select major jika user sudah memiliki jurusan
    const matched = majorsList.find(
      (m) =>
        m.id === user.majorId ||
        m.name.toLowerCase() === user.major?.toLowerCase() ||
        m.fullName.toLowerCase() === user.majorFullName?.toLowerCase()
    )
    setFormMajorId(matched?.id || user.majorId || (majorsList[0]?.id ?? ""))
    setEditError("")
    setIsEditModalOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditModalOpen(false)
    setEditingUser(null)
    setFormMajorId("")
    setFormNip("")
    setEditError("")
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    // Validasi jurusan jika role teacher atau student
    if ((formRole === "teacher" || formRole === "student") && !formMajorId) {
      setEditError("Silakan pilih jurusan terlebih dahulu.")
      return
    }

    const changes: Record<string, string> = {}
    if (formRole !== editingUser.role) changes.role = formRole
    if (formStatus !== editingUser.status) changes.status = formStatus
    if ((formRole === "teacher" || formRole === "student") && formMajorId) {
      changes.majorId = formMajorId
    }
    if (formRole === "teacher" && formNip !== (editingUser.nip || "")) {
      changes.nip = formNip
    }

    if (Object.keys(changes).length === 0) {
      handleCloseEdit()
      return
    }

    setIsSaving(true)
    setEditError("")
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      })
      const data = await res.json()
      if (!res.ok) {
        setEditError(data.error ?? "Gagal menyimpan perubahan.")
        return
      }
      showToast(`Akun ${editingUser.name} berhasil diperbarui.`, "success")
      handleCloseEdit()
      fetchUsers()
    } catch {
      setEditError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  // ── Deactivate Modal ───────────────────────────────────────────────────────
  const handleOpenDeactivate = (user: ApiUser) => {
    setDeactivatingUser(user)
    setIsDeactivateModalOpen(true)
  }

  const handleCloseDeactivate = () => {
    setIsDeactivateModalOpen(false)
    setDeactivatingUser(null)
  }

  const handleConfirmDeactivate = async () => {
    if (!deactivatingUser) return
    setIsDeactivating(true)
    try {
      const res = await fetch(`/api/admin/users/${deactivatingUser.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error ?? "Gagal menonaktifkan akun.", "error")
        return
      }
      showToast(data.message ?? `Akun ${deactivatingUser.name} dinonaktifkan.`, "success")
      handleCloseDeactivate()
      fetchUsers()
    } catch {
      showToast("Terjadi kesalahan jaringan. Coba lagi.", "error")
    } finally {
      setIsDeactivating(false)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200 relative">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="mt-1 text-base text-ink-700 max-w-[65ch]">
            {isLoading
              ? "Memuat data pengguna..."
              : `Daftar seluruh ${total.toLocaleString("id-ID")} akun pengguna yang terdaftar di sistem Kandaga.`}
          </p>
        </div>

        {/* ── Filter & Search Bar ─────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau email pengguna..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ink-150 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {[
              { value: "all", label: "Semua", count: counts.all ?? 0 },
              { value: "student", label: "Siswa", count: counts.student ?? 0 },
              { value: "teacher", label: "Guru", count: counts.teacher ?? 0 },
              { value: "company", label: "Mitra", count: counts.company ?? 0 },
              { value: "bkk", label: "BKK", count: counts.bkk ?? 0 },
              { value: "admin", label: "Admin", count: counts.admin ?? 0 },
            ].map(({ value, label, count }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRoleFilter(value)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
                  roleFilter === value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-ink-700 border-ink-150 hover:border-primary hover:text-primary"
                }`}
              >
                <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
                <span className={`font-bold text-xs ${roleFilter === value ? "text-white/80" : "text-ink-300"}`}>
                  ({count})
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={fetchUsers}
              title="Segarkan data"
              className="w-10 h-10 rounded-full border border-ink-150 bg-white flex items-center justify-center text-ink-300 hover:text-primary hover:border-primary transition cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Tabel Pengguna ───────────────────────────────────────────────── */}
        <div>
          {/* Error State */}
          {fetchError && !isLoading && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{fetchError}</span>
              <button
                type="button"
                onClick={fetchUsers}
                className="ml-auto text-xs text-primary underline underline-offset-2 cursor-pointer font-semibold"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-ink-300 animate-spin" aria-hidden="true" />
            </div>
          )}

          {/* Table */}
          {!isLoading && !fetchError && (
            <div className="overflow-hidden rounded-2xl border border-ink-150 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-100 border-b border-ink-150">
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Pengguna</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Role</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Status</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden md:table-cell">Terdaftar</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden lg:table-cell">Detail</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-ink-700 font-heading pr-5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-150 bg-white">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8">
                          <EmptyState
                            title="Tidak Ada Pengguna yang Cocok"
                            description="Tidak ada pengguna yang sesuai dengan filter role atau kata kunci pencarian Anda."
                            compact
                          />
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-ink-100/50 transition-colors group">
                          {/* Nama + Email */}
                          <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                                u.status === "nonaktif"
                                  ? "bg-ink-150 text-ink-300"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {getInitials(u.name)}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold truncate max-w-[140px] ${u.status === "nonaktif" ? "text-ink-300 line-through" : "text-ink"}`}>
                                {u.name}
                              </p>
                              <p className="text-ink-300 font-mono text-[10px] truncate max-w-[140px]">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            {ROLE_LABELS[u.role] ?? u.roleLabel}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                            u.status === "aktif"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : u.status === "nonaktif"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {u.status === "aktif" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : u.status === "nonaktif" ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            <span className="capitalize">{u.status}</span>
                          </span>
                        </td>

                        {/* Tanggal daftar */}
                        <td className="px-5 py-4 text-ink-600 hidden md:table-cell text-sm">
                          {formatDate(u.createdAt)}
                        </td>

                        {/* Detail kontekstual */}
                        <td className="px-5 py-4 text-ink-600 hidden lg:table-cell text-xs max-w-[200px]">
                          {u.role === "student" && u.nis && (
                            <span className="truncate block">
                              NIS {u.nis} · {u.kelas} · {u.majorFullName ?? u.major}
                            </span>
                          )}
                          {u.role === "teacher" && u.nip && (
                            <span className="truncate block">
                              NIP {u.nip} · {u.majorFullName ?? u.major}
                            </span>
                          )}
                          {u.role === "company" && u.companyName && (
                            <span className="truncate block">
                              {u.companyName}
                              {u.verificationStatus && (
                                <span className={`ml-1 font-semibold ${
                                  u.verificationStatus === "disetujui"
                                    ? "text-emerald-600"
                                    : u.verificationStatus === "ditolak"
                                    ? "text-rose-500"
                                    : "text-amber-600"
                                }`}>
                                  · {u.verificationStatus}
                                </span>
                              )}
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="px-5 py-4 text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              title="Edit role / status"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-300 hover:text-primary hover:bg-primary/10 transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeactivate(u)}
                              disabled={u.status === "nonaktif"}
                              title={u.status === "nonaktif" ? "Akun sudah nonaktif" : "Nonaktifkan akun"}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

          {/* ── Pagination ──────────────────────────────────────────────────── */}
          {!isLoading && !fetchError && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-ink-100">
              <p className="text-[10px] text-ink-300">
                Halaman {page} dari {totalPages} · {total} pengguna
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg border border-ink-150 flex items-center justify-center text-ink-300 hover:text-ink hover:border-ink-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                  const p = start + i
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        p === page
                          ? "bg-primary text-white"
                          : "border border-ink-150 text-ink-600 hover:border-ink-300"
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg border border-ink-150 flex items-center justify-center text-ink-300 hover:text-ink hover:border-ink-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─────────────── MODAL EDIT PENGGUNA ─────────────────────────────── */}
        {isEditModalOpen && editingUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={handleCloseEdit}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-ink-150 overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-ink-150 bg-ink-100/50">
                <div className="flex items-center gap-2.5">
                  <Pencil className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <h2 className="font-heading text-sm font-bold text-ink">Edit Akun Pengguna</h2>
                    <p className="text-[11px] text-ink-300">
                      Ubah role atau status akun {editingUser.name}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="w-7 h-7 rounded-lg bg-ink-100 hover:bg-ink-150 flex items-center justify-center text-ink-300 hover:text-ink-700 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
                {editError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Info readonly */}
                <div className="p-3 rounded-xl bg-ink-100 border border-ink-150 text-xs text-ink-600 space-y-0.5">
                  <p><span className="font-bold text-ink">Nama:</span> {editingUser.name}</p>
                  <p><span className="font-bold text-ink">Email:</span> {editingUser.email}</p>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">
                    Hak Akses (Role)
                  </label>
                  <div className="relative">
                    <Shield className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink-150 text-xs text-ink bg-ink-100/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition cursor-pointer"
                    >
                      <option value="student">Student (Siswa)</option>
                      <option value="teacher">Teacher (Guru Pembimbing)</option>
                      <option value="company">Company (Mitra Industri)</option>
                      <option value="bkk">BKK (Bursa Kerja Khusus)</option>
                      <option value="admin">Admin (Administrator)</option>
                    </select>
                  </div>
                </div>

                {/* Section Jurusan (Wajib jika Guru atau Siswa) */}
                {(formRole === "teacher" || formRole === "student") && (
                  <div className="p-3.5 rounded-xl bg-ink-100/60 border border-ink-150 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-ink-700 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-primary" />
                          <span>Bidang / Jurusan SMKN 13</span>
                        </label>
                        <span className="text-[10px] text-primary font-bold">*Wajib</span>
                      </div>
                      <select
                        value={formMajorId}
                        onChange={(e) => setFormMajorId(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-ink-150 text-xs text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition cursor-pointer"
                      >
                        <option value="" disabled>-- Pilih Jurusan SMKN 13 --</option>
                        {majorsList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} — {m.fullName}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[10px] text-ink-300">
                        {formRole === "teacher"
                          ? "Guru akan memiliki wewenang kurasi & verifikasi karya pada jurusan ini."
                          : "Siswa akan terdaftar dan dikelompokkan portofolionya pada jurusan ini."}
                      </p>
                    </div>

                    {formRole === "teacher" && (
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">
                          NIP Guru <span className="text-[10px] text-ink-300 font-normal">(Opsional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: 198203152010011002"
                          value={formNip}
                          onChange={(e) => setFormNip(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-ink-150 text-xs text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">
                    Status Akun
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-ink-150 text-xs text-ink bg-ink-100/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition cursor-pointer"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-ink-600 hover:bg-ink-100 transition cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-dark text-white shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────── MODAL NONAKTIFKAN ───────────────────────────────── */}
        {isDeactivateModalOpen && deactivatingUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={handleCloseDeactivate}
          >
            <div
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-ink-150 p-6 animate-in zoom-in-95 duration-200 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <UserX className="w-7 h-7 text-rose-600 mx-auto mb-3" />

              <h2 className="font-heading text-base font-bold text-ink mb-1.5">
                Nonaktifkan Akun?
              </h2>
              <p className="text-xs text-ink-600 leading-relaxed mb-4">
                Akun akan dinonaktifkan. Data dan karya pengguna{" "}
                <span className="font-semibold text-ink">tetap utuh</span> dan tidak dihapus
                dari database.
              </p>

              {/* Target Card */}
              <div className="p-3 rounded-xl bg-ink-100 border border-ink-150 flex items-center gap-3 text-left mb-5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(deactivatingUser.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink truncate">{deactivatingUser.name}</p>
                  <p className="text-[10px] text-ink-300 font-mono truncate">{deactivatingUser.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-primary/10 text-primary uppercase shrink-0">
                  {ROLE_LABELS[deactivatingUser.role] ?? deactivatingUser.role}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseDeactivate}
                  disabled={isDeactivating}
                  className="w-1/2 py-2 rounded-lg border border-ink-150 text-xs font-semibold text-ink-600 hover:bg-ink-100 transition cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  disabled={isDeactivating}
                  className="w-1/2 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeactivating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserX className="w-3.5 h-3.5" />
                  )}
                  {isDeactivating ? "Memproses..." : "Nonaktifkan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────── TOAST ───────────────────────────────────────────── */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
                toast.type === "success"
                  ? "bg-ink text-white border-ink-700"
                  : "bg-rose-600 text-white border-rose-700"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-white shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
