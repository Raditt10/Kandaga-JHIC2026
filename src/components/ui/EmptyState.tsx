"use client";

import React from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";

/**
 * EmptyState — tampilan terstandar untuk keadaan kosong (empty state)
 * di seluruh aplikasi Kandaga sesuai desain acuan.
 *
 * Setiap aksi menerima salah satu dari dua bentuk:
 *   - { label, href }    -> dirender sebagai tautan (<Link>)
 *   - { label, onClick } -> dirender sebagai tombol (<button>)
 *
 * `actions` dipakai bila butuh lebih dari satu tombol: yang pertama menjadi
 * tombol utama, sisanya tombol garis. `action` (tunggal) tetap didukung agar
 * pemakaian yang sudah ada tidak perlu diubah.
 */
export type EmptyStateAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; href?: never; onClick: () => void };

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Satu aksi. Dipertahankan demi kompatibilitas dengan pemakaian lama. */
  action?: EmptyStateAction;
  /** Beberapa aksi: yang pertama tombol utama, sisanya tombol garis. */
  actions?: EmptyStateAction[];
  className?: string;
  compact?: boolean;
}

/*
 * Gaya tombol mengikuti desain acuan yang dipakai ACTION_CLASS sebelumnya.
 * Tombol kedua memakai bentuk garis agar tetap terbaca sebagai aksi
 * sekunder, dengan ukuran dan ritme yang sama.
 */
const PRIMARY_CLASS =
  "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:bg-primary-dark shadow-xs cursor-pointer";

const SECONDARY_CLASS =
  "inline-flex items-center justify-center rounded-full border border-ink-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-ink-700 transition-all duration-200 hover:border-primary hover:text-primary shadow-xs cursor-pointer";

function EmptyStateActionButton({
  item,
  primary,
}: {
  item: EmptyStateAction;
  primary: boolean;
}) {
  const cls = primary ? PRIMARY_CLASS : SECONDARY_CLASS;

  if (item.href) {
    return (
      <Link href={item.href} className={cls}>
        {item.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={item.onClick} className={cls}>
      {item.label}
    </button>
  );
}

export function EmptyState({
  icon = <SearchX className="w-8 h-8 text-[#8B1A2F]" />,
  title,
  description,
  action,
  actions,
  className = "",
  compact = false,
}: EmptyStateProps) {
  const list: EmptyStateAction[] =
    actions && actions.length > 0 ? actions : action ? [action] : [];

  return (
    <div
      className={`flex w-full flex-col items-center justify-center text-center ${
        compact ? "py-8 px-4" : "py-12 sm:py-16 px-4"
      } ${className}`.trim()}
    >
      {icon && (
        <div className="mb-3 text-[#8B1A2F] flex items-center justify-center">
          {icon}
        </div>
      )}

      <h3 className="font-heading text-base sm:text-lg font-bold tracking-tight text-ink/75">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-ink-600/70 max-w-md mx-auto">
          {description}
        </p>
      )}

      {list.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {list.map((item, i) => (
            <EmptyStateActionButton
              key={`${item.label}-${i}`}
              item={item}
              primary={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
