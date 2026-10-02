"use client";

import { TrendingUp } from "lucide-react";
import { JurusanDetail } from "@/data/jurusanData";

// Tab Karir — di-lazy load, tidak ikut bundle awal halaman
export default function KarirTab({ jurusan }: { jurusan: JurusanDetail }) {
  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg font-semibold text-ink mb-6">
        Peluang Karir &amp; Profil Lulusan
      </h3>

      {/* List dengan border-bottom — bukan nested card (design-rules §6) */}
      {jurusan.careers.map((career, i) => (
        <div
          key={i}
          className="flex items-start gap-4 py-4 border-b border-ink-150 last:border-0"
        >
          <span
            className="font-mono text-xs font-bold text-ink-300 w-6 shrink-0 pt-0.5"
            aria-hidden="true"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 space-y-1">
            <h4 className="font-heading font-bold text-base text-ink">{career.role}</h4>
            <p className="text-sm text-ink-700 leading-relaxed max-w-[65ch]">{career.desc}</p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 text-xs text-ink-600">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>{career.demand}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
