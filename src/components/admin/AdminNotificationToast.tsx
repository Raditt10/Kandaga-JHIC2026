"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  ExternalLink,
  Layers,
  Building2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useAdminNotification } from "@/context/AdminNotificationContext";

export default function AdminNotificationToast() {
  const { latestIncoming, dismissToast, setIsModalOpen, markAsRead } = useAdminNotification();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!latestIncoming) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 6000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          dismissToast();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [latestIncoming, dismissToast]);

  if (!latestIncoming) return null;

  const getCategoryStyles = () => {
    switch (latestIncoming.category) {
      case "project":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-900",
          badge: "bg-blue-100 text-blue-800",
          icon: Layers,
        };
      case "mitra":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-900",
          badge: "bg-amber-100 text-amber-800",
          icon: Building2,
        };
      case "curation":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-900",
          badge: "bg-emerald-100 text-emerald-800",
          icon: CheckCircle2,
        };
      case "security":
      default:
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          text: "text-rose-900",
          badge: "bg-rose-100 text-rose-800",
          icon: ShieldAlert,
        };
    }
  };

  const styles = getCategoryStyles();
  const IconComponent = styles.icon;

  const handleOpen = () => {
    markAsRead(latestIncoming.id);
    dismissToast();
    setIsModalOpen(true);
  };

  return (
    <aside
      aria-label="Notifikasi Real-time Baru"
      className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/90 overflow-hidden relative">
        {/* Progress bar */}
        <div
          className="h-1 bg-[#8B1A2F] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${styles.bg} ${styles.border} border flex items-center justify-center shrink-0`}>
            <IconComponent className={`w-5 h-5 ${styles.text}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${styles.badge}`}>
                {latestIncoming.metadata?.badgeText || latestIncoming.category}
              </span>
              <span className="text-xs text-zinc-500 font-medium">Baru saja</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug line-clamp-1">
              {latestIncoming.title}
            </h4>

            <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
              {latestIncoming.message}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpen}
                className="px-3 py-1.5 rounded-lg bg-[#8B1A2F] hover:bg-[#6B1424] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Buka Detail</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={dismissToast}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            aria-label="Tutup notifikasi"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
