"use client";

import React from "react";
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
} from "./Skeleton";

export interface DetailSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  hasBreadcrumbs?: boolean;
  hasMedia?: boolean;
  mediaAspect?: "16/9" | "video" | "21/9" | "4/3";
  hasSidebar?: boolean;
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * DetailSkeleton — Global layout skeleton for entity detail pages
 * (e.g. Project Detail, Student Profile, Jurusan Detail).
 */
export function DetailSkeleton({
  hasBreadcrumbs = true,
  hasMedia = true,
  mediaAspect = "16/9",
  hasSidebar = true,
  animation = "pulse",
  className = "",
  ...props
}: DetailSkeletonProps) {
  const aspectClass = {
    "16/9": "aspect-[16/9]",
    video: "aspect-video",
    "21/9": "aspect-[21/9]",
    "4/3": "aspect-[4/3]",
  }[mediaAspect];

  return (
    <div
      className={`min-h-screen flex flex-col bg-white ${className}`.trim()}
      aria-hidden="true"
      {...props}
    >
      {/* ── Breadcrumb Bar Placeholder ── */}
      {hasBreadcrumbs && (
        <div className="border-b border-ink-150 bg-[#FBF9F6]">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-14 bg-ink-150" animation={animation} />
              <div className="h-2 w-2 rounded-full bg-ink-300" />
              <Skeleton className="h-4 w-20 bg-ink-150" animation={animation} />
              <div className="h-2 w-2 rounded-full bg-ink-300" />
              <Skeleton className="h-4 w-32 bg-ink-150" animation={animation} />
            </div>
            <Skeleton className="h-4 w-24 bg-ink-150 hidden sm:block" animation={animation} />
          </div>
        </div>
      )}

      <div className="flex-1 pt-8 pb-20">
        {/* ── Header Hero Section ── */}
        <section className="mx-auto max-w-7xl px-6 mb-8">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <SkeletonBadge size="md" width="w-20" animation={animation} />
            <SkeletonBadge size="md" width="w-32" animation={animation} />
            <SkeletonBadge size="md" width="w-24" animation={animation} />
          </div>

          {/* Title Lines */}
          <div className="space-y-3 mb-4">
            <Skeleton
              variant="rounded"
              animation={animation}
              className="h-10 sm:h-12 w-4/5 max-w-3xl bg-ink-150"
            />
            <Skeleton
              variant="rounded"
              animation={animation}
              className="h-10 sm:h-12 w-2/3 max-w-2xl bg-ink-150"
            />
          </div>

          {/* Subtitle / Excerpt */}
          <SkeletonText
            lines={2}
            widths={["w-full max-w-2xl", "w-3/4 max-w-xl"]}
            lineHeight="h-4"
            gap="space-y-2"
            animation={animation}
            className="mt-4"
          />

          {/* Creator Attribution Bar */}
          <div className="mt-6 pt-6 border-t border-ink-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SkeletonAvatar size="lg" animation={animation} />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 bg-ink-150" animation={animation} />
                <Skeleton className="h-3 w-40 bg-ink-100" animation={animation} />
              </div>
            </div>
            <SkeletonButton size="md" width="w-36" animation={animation} />
          </div>
        </section>

        {/* ── Main Media Showcase Placeholder ── */}
        {hasMedia && (
          <section className="mx-auto max-w-7xl px-6 mb-12">
            <Skeleton
              variant="rounded"
              animation={animation}
              className={`w-full rounded-3xl ${aspectClass} bg-ink-150`}
            />
            {/* Thumbnails strip */}
            <div className="mt-4 flex items-center gap-3">
              <Skeleton className="w-24 h-16 rounded-xl bg-ink-150" animation={animation} />
              <Skeleton className="w-24 h-16 rounded-xl bg-ink-150" animation={animation} />
              <Skeleton className="w-24 h-16 rounded-xl bg-ink-150 hidden sm:block" animation={animation} />
            </div>
          </section>
        )}

        {/* ── Main Content Grid Placeholder ── */}
        <div
          className={`mx-auto max-w-7xl px-6 grid grid-cols-1 ${
            hasSidebar ? "lg:grid-cols-12 gap-10" : ""
          }`}
        >
          {/* Main Column */}
          <div className={hasSidebar ? "lg:col-span-8 space-y-10" : "space-y-10"}>
            {/* Overview / Narrative Section 1 */}
            <div className="space-y-4">
              <Skeleton className="h-7 w-48 rounded-lg bg-ink-150" animation={animation} />
              <SkeletonText
                lines={4}
                widths={["w-full", "w-full", "w-11/12", "w-4/5"]}
                lineHeight="h-4"
                gap="space-y-2.5"
                animation={animation}
              />
            </div>

            {/* Feature / Bullet Points Section */}
            <div className="space-y-4 pt-8 border-t border-ink-150">
              <Skeleton className="h-7 w-56 rounded-lg bg-ink-150" animation={animation} />
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Skeleton variant="circular" className="w-5 h-5 bg-ink-150 shrink-0" animation={animation} />
                    <Skeleton className="h-4 w-3/4 bg-ink-100" animation={animation} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quote / Highlight Box */}
            <div className="p-6 rounded-2xl bg-cream border border-ink-150 space-y-3">
              <Skeleton className="h-5 w-40 bg-ink-150" animation={animation} />
              <SkeletonText
                lines={2}
                widths={["w-full", "w-5/6"]}
                lineHeight="h-4"
                animation={animation}
              />
            </div>
          </div>

          {/* Sidebar Column */}
          {hasSidebar && (
            <div className="lg:col-span-4 space-y-6">
              {/* Profile / Resource Box */}
              <div className="p-6 rounded-2xl border border-ink-150 bg-[#FBF9F6] space-y-4">
                <Skeleton className="h-5 w-32 bg-ink-150" animation={animation} />
                <div className="flex items-center gap-3 pt-2">
                  <SkeletonAvatar size="lg" animation={animation} />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-28 bg-ink-150" animation={animation} />
                    <Skeleton className="h-3 w-36 bg-ink-100" animation={animation} />
                  </div>
                </div>
                <SkeletonButton size="md" width="w-full" animation={animation} />
              </div>

              {/* Tags / Meta Box */}
              <div className="p-6 rounded-2xl border border-ink-150 bg-white space-y-3">
                <Skeleton className="h-5 w-28 bg-ink-150" animation={animation} />
                <div className="flex flex-wrap gap-2 pt-2">
                  <SkeletonBadge size="sm" width="w-16" animation={animation} />
                  <SkeletonBadge size="sm" width="w-20" animation={animation} />
                  <SkeletonBadge size="sm" width="w-14" animation={animation} />
                  <SkeletonBadge size="sm" width="w-24" animation={animation} />
                </div>
              </div>

              {/* Action Links Box */}
              <div className="p-6 rounded-2xl border border-ink-150 bg-white space-y-3">
                <Skeleton className="h-10 w-full rounded-xl bg-ink-150" animation={animation} />
                <Skeleton className="h-10 w-full rounded-xl bg-ink-100" animation={animation} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailSkeleton;
