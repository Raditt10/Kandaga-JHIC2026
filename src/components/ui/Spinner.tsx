"use client";

import React from "react";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "accent" | "neutral" | "white";
  label?: string;
}

/**
 * Spinner — Global accessible loading spinner with Kandaga branding.
 */
export function Spinner({
  size = "md",
  variant = "primary",
  label = "Memuat...",
  className = "",
  ...props
}: SpinnerProps) {
  const sizeMap = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variantMap = {
    primary: "text-primary",
    accent: "text-accent",
    neutral: "text-ink-600",
    white: "text-white",
  };

  return (
    <div className="inline-flex items-center justify-center" role="status">
      <svg
        className={`animate-spin ${sizeMap[size]} ${variantMap[variant]} ${className}`.trim()}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
        {...props}
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

export interface LoadingOverlayProps {
  label?: string;
  sublabel?: string;
  variant?: "primary" | "accent" | "neutral";
  size?: "md" | "lg" | "xl";
  fullScreen?: boolean;
  blur?: boolean;
  className?: string;
}

/**
 * LoadingOverlay — Centered loading spinner overlay for full-page or container loading.
 */
export function LoadingOverlay({
  label = "Memuat data...",
  sublabel,
  variant = "primary",
  size = "lg",
  fullScreen = false,
  blur = true,
  className = "",
}: LoadingOverlayProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center"
    : "absolute inset-0 z-20 flex items-center justify-center";

  const backdropClass = blur
    ? "bg-white/85 backdrop-blur-xs"
    : "bg-white/95";

  return (
    <div
      className={`${containerClass} ${backdropClass} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Spinner size={size} variant={variant} label="" />
        {label && (
          <p className="font-heading font-medium text-ink-900 text-sm sm:text-base">
            {label}
          </p>
        )}
        {sublabel && (
          <p className="text-xs text-ink-600 max-w-xs">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

export default Spinner;
