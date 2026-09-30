"use client";

import React from "react";
import Link from "next/link";
import { Code2, Network, FlaskConical, Layers } from "lucide-react";
import { JURUSAN_DATA } from "@/data/jurusanData";

interface JurusanNavTabsProps {
  activeId: string;
  onSelect?: (id: string) => void;
}

export default function JurusanNavTabs({ activeId, onSelect }: JurusanNavTabsProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "rpl":          return <Code2 className="w-4 h-4" />;
      case "tkj":          return <Network className="w-4 h-4" />;
      case "analis-kimia": return <FlaskConical className="w-4 h-4" />;
      default:             return null;
    }
  };

  return (
    <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-y border-ink-150 py-3 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-ink-600 select-none shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            <span>Navigasi jurusan:</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 mx-auto md:mx-0">
            {/* Tombol "Semua Jurusan" — scroll ke atas list */}
            <button
              type="button"
              onClick={() => onSelect?.("semua")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeId === "semua"
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-150 hover:text-ink"
              }`}
            >
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span>Semua Jurusan</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                activeId === "semua" ? "bg-white/20 text-white" : "bg-zinc-200 text-ink-600"
              }`}>
                3
              </span>
            </button>

            {JURUSAN_DATA.map((jurusan) => {
              const isActive = activeId === jurusan.id;
              return (
                <Link
                  key={jurusan.id}
                  href={`/jurusan/${jurusan.id}`}
                  onClick={() => onSelect?.(jurusan.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/25"
                      : "bg-ink-100 text-ink-700 hover:bg-ink-150 hover:text-ink"
                  }`}
                >
                  <span className={isActive ? "text-accent" : "text-ink-600"} aria-hidden="true">
                    {getIcon(jurusan.id)}
                  </span>
                  <span>{jurusan.name}</span>
                  {/* badge: text-xs minimum */}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-zinc-200 text-ink-600"
                  }`}>
                    {jurusan.duration.split(" ")[0]} Thn
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-ink-600 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" aria-hidden="true" />
            <span>Terakreditasi A • Kurikulum Industri</span>
          </div>

        </div>
      </div>
    </div>
  );
}
