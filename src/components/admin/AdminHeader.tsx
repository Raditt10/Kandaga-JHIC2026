"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Mail, Bell } from "lucide-react";
import { useAdminNotification } from "@/context/AdminNotificationContext";

export default function AdminHeader() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const { unreadCount, isModalOpen, setIsModalOpen, connectionStatus } = useAdminNotification();

  const adminName = session?.user?.username || session?.user?.name || "adit";

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 relative max-w-lg">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari karya siswa, pengguna, atau audit log..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337] transition"
        />
      </div>

      {/* Actions: Mail, Notification, User Profile */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Pesan masuk"
          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <Mail className="w-4 h-4" />
        </button>

        {/* Live Notification Bell with Dynamic Unread Counter */}
        <button
          type="button"
          onClick={() => setIsModalOpen(!isModalOpen)}
          aria-label={`Buka notifikasi admin (${unreadCount} belum dibaca)`}
          title={
            connectionStatus === "connected"
              ? "Notifikasi Web Real-time (Socket.IO Aktif)"
              : "Pusat Notifikasi & Aktivitas Web"
          }
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition relative cursor-pointer ${
            isModalOpen
              ? "bg-[#891337] text-white border-[#891337]"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bell className="w-4 h-4" />

          {/* Dynamic Unread Pill or Dot */}
          {unreadCount > 0 ? (
            <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-[#891337] text-white text-xs font-extrabold absolute -top-1.5 -right-1.5 flex items-center justify-center ring-2 ring-white shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : connectionStatus === "connected" ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-1 ring-white" />
          ) : null}
        </button>

        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#891337] to-[#a61743] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-900 leading-tight">
              {adminName}
            </span>
            <span className="block text-xs text-slate-500 font-medium">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
