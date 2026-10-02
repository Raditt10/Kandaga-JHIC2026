"use client";

import { Building2, CheckCircle2 } from "lucide-react";
import { JurusanDetail } from "@/data/jurusanData";

// Tab Fasilitas — di-lazy load, tidak ikut bundle awal halaman
export default function FasilitasTab({ jurusan }: { jurusan: JurusanDetail }) {
  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-semibold text-ink">
        Fasilitas &amp; Lab Industri
      </h3>

      {/* Tabel — pola berbeda dari grid kartu (design-rules §6) */}
      <div className="overflow-hidden rounded-2xl border border-ink-150">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-100 border-b border-ink-150">
              <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Fasilitas</th>
              <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden sm:table-cell">Spesifikasi</th>
              <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden md:table-cell">Fitur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-150 bg-white">
            {jurusan.facilities.map((fac, i) => (
              <tr key={i} className="hover:bg-ink-100/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                    <span className="font-medium text-ink">{fac.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-ink-700 hidden sm:table-cell">
                  <span className="font-mono text-xs bg-ink-100 px-2 py-1 rounded">{fac.spec}</span>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1.5">
                    {fac.features.map((feat, fi) => (
                      <span key={fi} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tools pill bar */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-ink-600">
          Perangkat, software &amp; instrumen yang dikuasai:
        </p>
        <div className="flex flex-wrap gap-2">
          {jurusan.toolsTech.map((tool, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-ink-100 text-ink-700 border border-ink-150">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
