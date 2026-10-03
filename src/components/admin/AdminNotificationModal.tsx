"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Sparkles,
  Layers,
  Building2,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Filter,
} from "lucide-react";
import { useAdminNotification } from "@/context/AdminNotificationContext";
import type { AdminNotification, NotificationCategory } from "@/types/notification";

function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 45) return "Baru saja";
    if (diffSec < 90) return "1 menit lalu";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Baru saja";
  }
}

export default function AdminNotificationModal() {
  const {
    notifications,
    unreadCount,
    connectionStatus,
    isModalOpen,
    setIsModalOpen,
    activeCategory,
    setActiveCategory,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    simulateActivity,
  } = useAdminNotification();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, setIsModalOpen]);

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") return notifications;
    return notifications.filter((n) => n.category === activeCategory);
  }, [notifications, activeCategory]);

  const countsByCategory = useMemo(() => {
    return {
      all: notifications.length,
      project: notifications.filter((n) => n.category === "project").length,
      mitra: notifications.filter((n) => n.category === "mitra").length,
      curation: notifications.filter((n) => n.category === "curation").length,
      security: notifications.filter((n) => n.category === "security").length,
    };
  }, [notifications]);

  if (!isModalOpen) return null;

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "project":
        return {
          icon: Layers,
          bg: "bg-blue-50",
          border: "border-blue-200",
          color: "text-blue-700",
          label: "Karya Siswa",
        };
      case "mitra":
        return {
          icon: Building2,
          bg: "bg-amber-50",
          border: "border-amber-200",
          color: "text-amber-800",
          label: "Mitra Industri",
        };
      case "curation":
        return {
          icon: CheckCircle2,
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          color: "text-emerald-800",
          label: "Kurasi Guru",
        };
      case "security":
      default:
        return {
          icon: ShieldAlert,
          bg: "bg-rose-50",
          border: "border-rose-200",
          color: "text-rose-800",
          label: "Audit & Sistem",
        };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-200"
      onClick={() => setIsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-notification-title"
    >
      {/* Drawer Panel Container */}
      <div
        className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="p-6 border-b border-zinc-200 bg-[#FBF9F6] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8B1A2F]/10 border border-[#8B1A2F]/20 flex items-center justify-center text-[#8B1A2F] shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="modal-notification-title"
                    className="font-heading text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight"
                  >
                    Aktivitas & Notifikasi Web
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#8B1A2F] text-white">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Pantau interaksi siswa, kurasi guru, dan mitra industri secara real-time.
                </p>
              </div>
            </div>

            {/* Actions: Sound & Close */}
            <div className="flex items-center gap-2">
              {/* Socket Status Badge */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition">
                {connectionStatus === "connected" ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Socket Aktif</span>
                  </span>
                ) : connectionStatus === "connecting" ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Menghubungkan</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-zinc-600 bg-zinc-100 border-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    <span>Socket Siap</span>
                  </span>
                )}
              </div>

              {/* Mute/Unmute Chime */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Nonaktifkan suara notifikasi" : "Aktifkan suara notifikasi"}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition cursor-pointer border border-zinc-200/80"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup panel notifikasi"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 transition cursor-pointer border border-zinc-200/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Category Filter Tabs ── */}
          <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 no-scrollbar">
            {(
              [
                { id: "all", label: "Semua", count: countsByCategory.all },
                { id: "project", label: "Karya Siswa", count: countsByCategory.project },
                { id: "mitra", label: "Mitra BKK", count: countsByCategory.mitra },
                { id: "curation", label: "Kurasi Guru", count: countsByCategory.curation },
                { id: "security", label: "Keamanan", count: countsByCategory.security },
              ] as const
            ).map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as NotificationCategory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#8B1A2F] text-white shadow-xs"
                      : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200/80"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Control Action Toolbar ── */}
          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-200/80 text-xs">
            <span className="text-zinc-500 font-medium">
              Menampilkan {filteredNotifications.length} aktivitas
            </span>

            <div className="flex items-center gap-2">
              {/* Test Live Broadcast Button */}
              <button
                type="button"
                onClick={() => simulateActivity()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Kirim event notifikasi live melalui socket untuk pengujian"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B1A2F]" />
                <span>Uji Siaran Live</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tandai Dibaca</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-zinc-600 hover:text-rose-800 hover:bg-zinc-100 transition cursor-pointer"
                  title="Hapus seluruh riwayat notifikasi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bersihkan</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable Notifications Feed ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FAFAF8]">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const meta = getNotificationIcon(notif.category);
              const IconComp = meta.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                    notif.read
                      ? "bg-white border-zinc-200/80 hover:border-zinc-300 shadow-2xs"
                      : "bg-white border-[#8B1A2F]/30 hover:border-[#8B1A2F] shadow-sm ring-1 ring-[#8B1A2F]/10"
                  }`}
                >
                  {/* Unread dot indicator */}
                  {!notif.read && (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-[#8B1A2F] absolute top-4 right-4"
                      title="Belum dibaca"
                    />
                  )}

                  <div className="flex items-start gap-3.5">
                    {/* Category Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <IconComp className={`w-5 h-5 ${meta.color}`} />
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      {/* Top Meta row */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                            notif.category === "project"
                              ? "bg-blue-100 text-blue-800"
                              : notif.category === "mitra"
                              ? "bg-amber-100 text-amber-800"
                              : notif.category === "curation"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {notif.metadata?.badgeText || meta.label}
                        </span>

                        <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{formatRelativeTime(notif.timestamp)}</span>
                        </span>
                      </div>

                      {/* Title & Message */}
                      <h3 className="font-heading text-sm font-bold text-zinc-900 leading-snug">
                        {notif.title}
                      </h3>

                      <p className="mt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Action Links & Buttons */}
                      <div className="mt-3 flex items-center gap-3 pt-2 border-t border-zinc-100">
                        {notif.metadata?.url && (
                          <Link
                            href={notif.metadata.url}
                            onClick={() => {
                              markAsRead(notif.id);
                              setIsModalOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#8B1A2F] hover:underline"
                          >
                            <span>Buka Halaman Terkait</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {!notif.read && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="text-xs text-zinc-500 hover:text-zinc-800 font-semibold transition"
                          >
                            Tandai dibaca
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="text-xs text-zinc-400 hover:text-rose-600 font-medium ml-auto transition"
                          title="Hapus notifikasi ini"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
                <Bell className="w-7 h-7 text-zinc-400" />
              </div>
              <h3 className="font-heading text-base font-bold text-zinc-900">
                Belum Ada Aktivitas Baru
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm leading-relaxed">
                Tidak ada riwayat notifikasi untuk filter &quot;{activeCategory}&quot;. Semua aktivitas baru dari
                siswa dan mitra akan disiarkan ke sini secara real-time.
              </p>
              <button
                type="button"
                onClick={() => simulateActivity()}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B1A2F] hover:bg-[#6B1424] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulasikan Aktivitas Siswa</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Kanal: <code className="font-mono text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">admin_channel</code> via Socket.IO</span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer text-center"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
