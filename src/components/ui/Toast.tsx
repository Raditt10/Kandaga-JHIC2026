"use client"

import React, { useEffect } from "react"
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
  duration?: number
  title?: string
}

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 4000,
  title,
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const isSuccess = type === "success"
  const isError = type === "error"

  const bgClasses = isSuccess
    ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-950/25"
    : isError
    ? "bg-rose-600 border-rose-500 text-white shadow-rose-950/25"
    : "bg-ink border-ink-700 text-white shadow-ink/25"

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92vw] sm:w-[460px] pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div
        className={`p-3.5 sm:p-4 rounded-2xl shadow-2xl border flex items-start gap-3 relative overflow-hidden ${bgClasses}`}
      >
        {/* Icon Badge */}
        <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-white" aria-hidden="true" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-white" aria-hidden="true" />
          ) : (
            <Info className="w-5 h-5 text-white" aria-hidden="true" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          {title ? (
            <>
              <h4 className="font-heading font-bold text-sm text-white leading-snug">
                {title}
              </h4>
              <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                {message}
              </p>
            </>
          ) : (
            <p className="text-xs font-semibold text-white leading-relaxed pt-1">
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition cursor-pointer shrink-0 mt-0.5"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast
