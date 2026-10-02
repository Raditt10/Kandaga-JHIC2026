"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "rounded" | "circular" | "text" | "card";
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * Skeleton — Atomic loading placeholder primitive.
 * Styled using Kandaga neutral tokens (ink-150 / ink-100)
 * with respect for prefers-reduced-motion.
 */
export function Skeleton({
  className = "",
  variant = "default",
  animation = "pulse",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    default: "rounded-lg",
    rounded: "rounded-2xl",
    circular: "rounded-full",
    text: "rounded-md h-4 w-full",
    card: "rounded-2xl w-full",
  }[variant];

  const animationStyles = {
    pulse: "animate-pulse",
    shimmer:
      "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
    none: "",
  }[animation];

  return (
    <div
      className={`bg-ink-150/80 shrink-0 ${variantStyles} ${animationStyles} ${className}`.trim()}
      aria-hidden="true"
      {...props}
    />
  );
}

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  widths?: string[];
  lineHeight?: string;
  gap?: string;
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * SkeletonText — Multi-line text placeholder with organic staggered widths.
 */
export function SkeletonText({
  lines = 3,
  widths = ["w-full", "w-5/6", "w-3/4"],
  lineHeight = "h-3.5",
  gap = "space-y-2",
  animation = "pulse",
  className = "",
  ...props
}: SkeletonTextProps) {
  return (
    <div className={`${gap} ${className}`.trim()} aria-hidden="true" {...props}>
      {Array.from({ length: lines }).map((_, index) => {
        const widthClass = widths[index % widths.length] || "w-full";
        return (
          <Skeleton
            key={index}
            variant="text"
            animation={animation}
            className={`${lineHeight} ${widthClass}`}
          />
        );
      })}
    </div>
  );
}

export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded";
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * SkeletonAvatar — Avatar loading placeholder with preset size scales.
 */
export function SkeletonAvatar({
  size = "md",
  shape = "circle",
  animation = "pulse",
  className = "",
  ...props
}: SkeletonAvatarProps) {
  const sizeStyles = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }[size];

  const shapeStyles = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <Skeleton
      animation={animation}
      className={`${sizeStyles} ${shapeStyles} ${className}`.trim()}
      {...props}
    />
  );
}

export interface SkeletonBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  width?: string;
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * SkeletonBadge — Pill / chip loading placeholder.
 */
export function SkeletonBadge({
  size = "md",
  width = "w-16",
  animation = "pulse",
  className = "",
  ...props
}: SkeletonBadgeProps) {
  const heightStyles = {
    sm: "h-5",
    md: "h-6",
    lg: "h-8",
  }[size];

  return (
    <Skeleton
      variant="circular"
      animation={animation}
      className={`${heightStyles} ${width} ${className}`.trim()}
      {...props}
    />
  );
}

export interface SkeletonButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  width?: string;
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * SkeletonButton — Button loading placeholder.
 */
export function SkeletonButton({
  size = "md",
  width = "w-28",
  animation = "pulse",
  className = "",
  ...props
}: SkeletonButtonProps) {
  const heightStyles = {
    sm: "h-8 rounded-lg",
    md: "h-10 rounded-xl",
    lg: "h-12 rounded-2xl",
  }[size];

  return (
    <Skeleton
      animation={animation}
      className={`${heightStyles} ${width} ${className}`.trim()}
      {...props}
    />
  );
}

export default Skeleton;
