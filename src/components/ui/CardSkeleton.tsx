"use client";

import React from "react";
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonBadge,
} from "./Skeleton";

export interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  mediaAspect?: "16/10" | "video" | "square" | "4/3" | "none";
  hasMedia?: boolean;
  hasBadges?: boolean;
  lines?: number;
  hasChips?: boolean;
  chipCount?: number;
  hasFooter?: boolean;
  footerType?: "author" | "action" | "simple";
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * CardSkeleton — Global reusable card loading placeholder.
 * Works seamlessly for project cards, student cards, article previews, etc.
 */
export function CardSkeleton({
  mediaAspect = "16/10",
  hasMedia = true,
  hasBadges = true,
  lines = 2,
  hasChips = true,
  chipCount = 3,
  hasFooter = true,
  footerType = "author",
  animation = "pulse",
  className = "",
  ...props
}: CardSkeletonProps) {
  const aspectClass = {
    "16/10": "aspect-[16/10]",
    video: "aspect-video",
    square: "aspect-square",
    "4/3": "aspect-[4/3]",
    none: "",
  }[mediaAspect];

  return (
    <div
      className={`relative flex flex-col bg-white rounded-2xl border border-ink-150 overflow-hidden shadow-xs ${className}`.trim()}
      aria-hidden="true"
      {...props}
    >
      {/* ── Media Placeholder ── */}
      {hasMedia && mediaAspect !== "none" && (
        <div className={`relative w-full bg-ink-150/70 overflow-hidden ${aspectClass}`}>
          {hasBadges && (
            <>
              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <SkeletonBadge size="sm" width="w-16" animation={animation} className="bg-white/80" />
                <SkeletonBadge size="sm" width="w-24" animation={animation} className="bg-white/80" />
              </div>

              {/* Bottom Metadata Badges */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <SkeletonBadge size="sm" width="w-20" animation={animation} className="bg-black/20" />
                <SkeletonBadge size="sm" width="w-16" animation={animation} className="bg-black/20" />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Content Placeholder ── */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 space-y-3">
        {/* Title */}
        <Skeleton
          variant="rounded"
          animation={animation}
          className="h-6 w-3/4 bg-ink-150"
        />

        {/* Narrative Lines */}
        {lines > 0 && (
          <SkeletonText
            lines={lines}
            widths={["w-full", "w-4/5", "w-2/3"]}
            lineHeight="h-3.5"
            gap="space-y-1.5"
            animation={animation}
            className="pt-1"
          />
        )}

        {/* Chips / Skills */}
        {hasChips && chipCount > 0 && (
          <div className="pt-2 flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: chipCount }).map((_, i) => (
              <SkeletonBadge
                key={i}
                size="sm"
                width={i % 2 === 0 ? "w-14" : "w-16"}
                animation={animation}
                className="bg-ink-100"
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {hasFooter && (
          <div className="mt-4 pt-4 border-t border-ink-150 flex items-center justify-between gap-3">
            {footerType === "author" && (
              <>
                <div className="flex items-center gap-2.5">
                  <SkeletonAvatar size="sm" animation={animation} />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24 bg-ink-150" />
                    <Skeleton className="h-2.5 w-16 bg-ink-100" />
                  </div>
                </div>
                <Skeleton variant="circular" className="w-8 h-8 bg-ink-100 shrink-0" />
              </>
            )}

            {footerType === "action" && (
              <>
                <Skeleton className="h-4 w-28 bg-ink-150" />
                <Skeleton className="h-8 w-20 rounded-lg bg-ink-150 shrink-0" />
              </>
            )}

            {footerType === "simple" && (
              <Skeleton className="h-3.5 w-32 bg-ink-150" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export interface CardSkeletonGridProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  cardProps?: Partial<CardSkeletonProps>;
}

/**
 * CardSkeletonGrid — Responsive grid of card skeletons.
 */
export function CardSkeletonGrid({
  count = 6,
  columns = 3,
  cardProps,
  className = "",
  ...props
}: CardSkeletonGridProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  return (
    <div
      className={`grid ${colClass} gap-6 sm:gap-8 ${className}`.trim()}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} {...cardProps} />
      ))}
    </div>
  );
}

export default CardSkeleton;
