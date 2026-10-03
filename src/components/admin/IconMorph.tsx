"use client"

import { useEffect, useRef } from "react"
import * as flubberNamespace from "flubber"

type Interpolator = (t: number) => string
type InterpolateFn = (fromShape: string, toShape: string) => Interpolator

type IconMorphProps = {
  /**
   * Daftar bentuk yang saling bermorfosis, berurutan lalu kembali ke bentuk pertama.
   * Setiap bentuk berupa daftar subpath (satu per goresan); jumlahnya harus sama antar bentuk.
   */
  shapes: string[][]
  /** Lama tiap bentuk ditahan sebelum bermorfosis (ms). */
  holdMs?: number
  /** Lama proses morfosis antar bentuk (ms). */
  morphMs?: number
  className?: string
}

/** Cari fungsi `interpolate` dari `flubber` (library ini dikirim sebagai ESM sekaligus UMD). */
const resolveInterpolate = (): InterpolateFn | null => {
  const candidates = flubberNamespace as unknown as {
    interpolate?: InterpolateFn
    default?: { interpolate?: InterpolateFn }
  }
  return candidates.interpolate ?? candidates.default?.interpolate ?? null
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Ikon SVG yang bermorfosis antar bentuk memakai interpolasi `flubber`.
 * Atribut `d` tiap subpath diperbarui langsung ke DOM per frame (tanpa re-render React),
 * dan animasi otomatis dimatikan bila pengguna mengaktifkan "reduce motion".
 */
export default function IconMorph({ shapes, holdMs = 1300, morphMs = 900, className }: IconMorphProps) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([])

  useEffect(() => {
    const paths = pathRefs.current.slice(0, shapes[0]?.length ?? 0)
    if (!paths.length || paths.some((path) => !path)) return

    const drawFrame = (subpaths: string[]) => {
      subpaths.forEach((d, index) => paths[index]?.setAttribute("d", d))
    }

    drawFrame(shapes[0])

    const interpolate = resolveInterpolate()
    if (shapes.length === 1 || !interpolate) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Interpolator tiap pasangan bentuk berurutan (bentuk terakhir menutup ke bentuk pertama)
    const morphs = shapes.map((shape, index) => {
      const next = shapes[(index + 1) % shapes.length]
      return shape.map((subpath, strokeIndex) => interpolate(subpath, next[strokeIndex]))
    })

    const segmentMs = holdMs + morphMs
    const cycleMs = segmentMs * shapes.length
    const start = performance.now()
    let frame = 0

    const render = (now: number) => {
      const elapsed = (now - start) % cycleMs
      const segment = Math.floor(elapsed / segmentMs)
      const local = elapsed - segment * segmentMs

      drawFrame(
        local < holdMs
          ? shapes[segment]
          : morphs[segment].map((interpolator) => interpolator(easeInOutCubic((local - holdMs) / morphMs))),
      )

      frame = requestAnimationFrame(render)
    }

    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [shapes, holdMs, morphMs])

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {(shapes[0] ?? []).map((_, index) => (
        <path
          key={index}
          ref={(element) => {
            pathRefs.current[index] = element
          }}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}
