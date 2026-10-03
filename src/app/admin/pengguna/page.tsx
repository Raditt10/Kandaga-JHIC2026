"use client"

import React, { useState, useEffect } from "react"
import { usersDatabase, UserAccount, Role } from "@/lib/users"
import {
  CheckCircle2,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  User,
  Mail,
  Shield,
  KeyRound,
  Check,
  AlertCircle,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

export default function AdminPenggunaPage() {
  const [usersList, setUsersList] = useState<UserAccount[]>(usersDatabase)
  const [userSearch, setUserSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Modal Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [formUsername, setFormUsername] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formRole, setFormRole] = useState<Role>("student")
  const [formPassword, setFormPassword] = useState("")
  const [editError, setEditError] = useState("")

  // Modal Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null)

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Handle ESC key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditModalOpen) handleCloseEdit()
        if (isDeleteModalOpen) handleCloseDelete()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isEditModalOpen, isDeleteModalOpen])

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchRole = roleFilter === "all" ? true : u.role === roleFilter
    const matchSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    return matchRole && matchSearch
  })

  // Open Edit Modal
  const handleOpenEdit = (user: UserAccount) => {
    if (user.role === "student" || user.role === "company") {
      showToast(
        `Admin tidak dapat mengubah data akun ${user.role === "student" ? "siswa" : "perusahaan"}.`,
        "error"
      )
      return
    }

    setEditingUser(user)
    setFormUsername(user.username)
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormPassword("")
    setEditError("")
    setIsEditModalOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditModalOpen(false)
    setEditingUser(null)
    setEditError("")
  }

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (editingUser.role === "student" || editingUser.role === "company") {
      setEditError(
        `Admin tidak memiliki izin untuk mengubah data akun ${
          editingUser.role === "student" ? "siswa" : "perusahaan"
        }.`
      )
      return
    }

    const trimmedUsername = formUsername.trim()
    const trimmedEmail = formEmail.trim().toLowerCase()

    if (!trimmedUsername || !trimmedEmail) {
      setEditError("Username dan Email wajib diisi.")
      return
    }

    // Check duplicate username or email with other users
    const duplicate = usersList.find(
      (u) =>
        u.id !== editingUser.id &&
        (u.username.toLowerCase() === trimmedUsername.toLowerCase() ||
          u.email.toLowerCase() === trimmedEmail)
    )

    if (duplicate) {
      setEditError("Username atau Email sudah digunakan oleh pengguna lain.")
      return
    }

    const updatedUser: UserAccount = {
      ...editingUser,
      username: trimmedUsername,
      email: trimmedEmail,
      role: formRole,
      password: formPassword.trim() ? formPassword.trim() : editingUser.password,
    }

    // Update in-memory runtime usersDatabase
    const dbIndex = usersDatabase.findIndex((u) => u.id === editingUser.id)
    if (dbIndex !== -1) {
      usersDatabase[dbIndex] = updatedUser
    }

    setUsersList((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)))
    handleCloseEdit()
    showToast(`Akun ${trimmedUsername} berhasil diperbarui.`, "success")
  }

  // Open Delete Modal
  const handleOpenDelete = (user: UserAccount) => {
    setDeletingUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false)
    setDeletingUser(null)
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingUser) return

    const deletedName = deletingUser.username

    // Remove from in-memory runtime usersDatabase
    const dbIndex = usersDatabase.findIndex((u) => u.id === deletingUser.id)
    if (dbIndex !== -1) {
      usersDatabase.splice(dbIndex, 1)
    }

    setUsersList((prev) => prev.filter((u) => u.id !== deletingUser.id))
    handleCloseDelete()
    showToast(`Akun ${deletedName} berhasil dihapus dari sistem.`, "success")
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200 relative">
        {/* Page Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-ink-150 shadow-xs">
          <div>
            <h1 className="font-heading text-lg font-bold text-ink">
              Manajemen Pengguna
            </h1>
            <p className="text-xs text-ink-600">
              Kelola dan atur kredensial akun dari 5 role di Kandaga ({filteredUsers.length} pengguna).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari user / email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-ink-150 text-xs bg-ink-100 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-ink-300" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-ink-150 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer"
              >
                <option value="all">Semua Role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="company">Company</option>
                <option value="bkk">BKK</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-ink-150 p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ink-150 text-[10px] text-ink-300 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Username</th>
                  <th className="pb-3 font-bold">Email</th>
                  <th className="pb-3 font-bold">Role</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-300 text-xs">
                      Tidak ada pengguna yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-ink-100/60 transition group">
                      <td className="py-3.5 font-bold text-ink">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-ink-100 text-ink-700 font-bold text-xs flex items-center justify-center">
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{u.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-ink-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1">
                          {u.role === "student" || u.role === "company" ? (
                            <button
                              type="button"
                              disabled
                              title={`Akun ${u.role === "student" ? "siswa" : "perusahaan"} dilindungi (tidak dapat diedit)`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-300 cursor-not-allowed opacity-40"
                              aria-disabled="true"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              title="Edit Pengguna"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-300 hover:text-primary hover:bg-primary/10 transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(u)}
                            title="Hapus Pengguna"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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

        {/* ─────────────── MODAL EDIT PENGGUNA ─────────────── */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-ink-150 overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-ink-150 bg-ink-100/50">
                <div className="flex items-center gap-2.5">
                  <Pencil className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <h2 className="font-heading text-sm font-bold text-ink">
                      Edit Data Pengguna
                    </h2>
                    <p className="text-[11px] text-ink-300">
                      Perbarui informasi kredensial dan hak akses akun.
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

              {/* Modal Body / Form */}
              <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
                {editError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Username Field */}
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      required
                      placeholder="Masukkan username..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink-150 text-xs text-ink bg-ink-100/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">
                    Email Terdaftar
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                      placeholder="nama@domain.com"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink-150 text-xs text-ink bg-ink-100/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">
                    Hak Akses (Role)
                  </label>
                  <div className="relative">
                    <Shield className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as Role)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink-150 text-xs text-ink bg-ink-100/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition capitalize cursor-pointer"
                    >
                      <option value="student">Student (Siswa)</option>
                      <option value="teacher">Teacher (Guru Pembimbing)</option>
                      <option value="company">Company (Mitra Industri)</option>
                      <option value="bkk">BKK (Bursa Kerja Khusus)</option>
                      <option value="admin">Admin (Administrator)</option>
                    </select>
                  </div>
                </div>

                {/* Password Field (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">
                    Ganti Password{" "}
                    <span className="font-normal text-ink-300 text-[10px]">
                      (Kosongkan jika tidak diubah)
                    </span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Ketik password baru..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink-150 text-xs text-ink bg-ink-100/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition placeholder:text-ink-300"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-ink-600 hover:bg-ink-100 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-dark text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────── MODAL KONFIRMASI HAPUS ─────────────── */}
        {isDeleteModalOpen && deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-ink-150 p-6 animate-in zoom-in-95 duration-200 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle className="w-7 h-7 text-rose-600 mx-auto mb-3" />

              <h2 className="font-heading text-base font-bold text-ink mb-1.5">
                Hapus Akun Pengguna?
              </h2>
              <p className="text-xs text-ink-600 leading-relaxed mb-4">
                Apakah Anda yakin ingin menghapus akun ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>

              {/* Target User Summary Card */}
              <div className="p-3 rounded-xl bg-ink-100 border border-ink-150 flex items-center gap-3 text-left mb-5">
                <div className="w-8 h-8 rounded-lg bg-ink-150 text-ink-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {deletingUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink truncate">
                    {deletingUser.username}
                  </p>
                  <p className="text-[10px] text-ink-300 font-mono truncate">
                    {deletingUser.email}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-primary/10 text-primary uppercase shrink-0">
                  {deletingUser.role}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseDelete}
                  className="w-1/2 py-2 rounded-lg border border-ink-150 text-xs font-semibold text-ink-600 hover:bg-ink-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="w-1/2 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Akun
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────── TOAST NOTIFICATION ─────────────── */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
                toast.type === "success"
                  ? "bg-ink text-white border-ink-700"
                  : "bg-rose-600 text-white border-rose-700"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
