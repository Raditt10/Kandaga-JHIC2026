"use client";

import React from "react";
import { Code2, Network, FlaskConical, Layers } from "lucide-react";
import { JURUSAN_DATA } from "@/data/jurusanData";

interface JurusanNavTabsProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export default function JurusanNavTabs({ activeId, onSelect }: JurusanNavTabsProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "rpl":
        return <Code2 className="w-4 h-4" />;
      case "tkj":
        return <Network className="w-4 h-4" />;
      case "analis-kimia":
        return <FlaskConical className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-y border-zinc-200/80 py-3 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400 select-none shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#8B1A2F]" />
            <span className="uppercase tracking-wider">Navigasi Jurusan:</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 mx-auto md:mx-0">
            {/* Tab: Semua Jurusan */}
            <button
              type="button"
              onClick={() => onSelect("semua")}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeId === "semua"
                  ? "bg-[#8B1A2F] text-white shadow-sm shadow-[#8B1A2F]/25 scale-102"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Semua Jurusan</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                  activeId === "semua"
                    ? "bg-white/20 text-white"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                3
              </span>
            </button>

            {JURUSAN_DATA.map((jurusan) => {
              const isActive = activeId === jurusan.id;
              return (
                <button
                  key={jurusan.id}
                  type="button"
                  onClick={() => onSelect(jurusan.id)}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#8B1A2F] text-white shadow-sm shadow-[#8B1A2F]/25 scale-102"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900"
                  }`}
                >
                  <span className={isActive ? "text-[#E8C97A]" : "text-zinc-500"}>
                    {getIcon(jurusan.id)}
                  </span>
                  <span>{jurusan.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {jurusan.duration.split(" ")[0]} Thn
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-ink-600 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Terakreditasi A • Kurikulum Industri</span>
          </div>

        </div>
      </div>
    </div>
  );
}
