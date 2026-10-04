"use client";

import React from "react";
import Link from "next/link";

/**
 * EmptyState — tampilan untuk keadaan kosong atau gagal memuat.
 *
 * Komponen ini semula diimpor oleh GallerySection tetapi berkasnya tidak
 * pernah ada, sehingga `npm run build` gagal dengan TS2307 dan situs tidak
 * bisa di-deploy. Berkas ini melengkapinya.
 *
 * Dipakai di tempat yang tadinya hanya menyisakan ruang kosong: galeri yang
 * belum punya karya terpublikasi, atau daftar yang gagal diambil.
 *
 * `action` menerima salah satu dari dua bentuk:
 *   - { label, href }    -> dirender sebagai tautan (<Link>)
 *   - { label, onClick } -> dirender sebagai tombol (<button>)
 */
export type EmptyStateAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; href?: never; onClick: () => void };

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

/*
 * Memakai token warna proyek (primary / primary-dark / ink-*), bukan nilai
 * heksadesimal literal, sesuai aturan desain di docs/AGENTS.md.
 */
const ACTION_CLASS =
  "mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex w-full max-w-md flex-col items-center text-center ${className}`.trim()}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-150 bg-[#FBF9F6]">
          {icon}
        </div>
      )}

      <h3 className="font-heading text-lg font-bold tracking-tight text-ink-900">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{description}</p>
      )}

      {action &&
        (action.href ? (
          <Link href={action.href} className={ACTION_CLASS}>
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={ACTION_CLASS}>
            {action.label}
          </button>
        ))}
    </div>
  );
}

export default EmptyState;
