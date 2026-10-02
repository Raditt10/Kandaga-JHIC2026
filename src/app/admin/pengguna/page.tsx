"use client"

import React, { useState } from "react"
import { usersDatabase, UserAccount } from "@/lib/users"
import { CheckCircle2, Search, Filter, Plus } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

export default function AdminPenggunaPage() {
  const [usersList, setUsersList] = useState<UserAccount[]>(usersDatabase)
  const [userSearch, setUserSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filteredUsers = usersList.filter((u) => {
    const matchRole = roleFilter === "all" ? true : u.role === roleFilter
    const matchSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="font-heading text-lg font-bold text-slate-900">
            Manajemen Pengguna
          </h1>
          <p className="text-xs text-slate-500">
            Kelola dan atur kredensial akun dari 5 role di Kandaga ({filteredUsers.length} pengguna).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari user / email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#891337]/15"
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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-bold">Username</th>
                <th className="pb-3 font-bold">Email</th>
                <th className="pb-3 font-bold">Role</th>
                <th className="pb-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-500 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#891337]/10 text-[#891337] uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
)
}
