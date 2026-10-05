"use client";

import React from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";

/**
 * EmptyState — tampilan terstandar untuk keadaan kosong (empty state)
 * di seluruh aplikasi Kandaga sesuai desain acuan.
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
  compact?: boolean;
}

const ACTION_CLASS =
  "mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:bg-primary-dark shadow-xs cursor-pointer";

export function EmptyState({
  icon = <SearchX className="w-8 h-8 text-[#8B1A2F]" />,
  title,
  description,
  action,
  className = "",
  compact = false,
}: EmptyStateProps) {
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

      <h3 className="font-heading text-base sm:text-lg font-bold tracking-tight text-ink">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-ink-600/90 max-w-md mx-auto">
          {description}
        </p>
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
