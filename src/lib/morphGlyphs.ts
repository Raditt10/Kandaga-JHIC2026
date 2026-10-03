/**
 * Glif line-art untuk ikon bermorfosis (dipakai `IconMorph` + `flubber`).
 *
 * `flubber` menginterpolasi bentuk *terisi*, bukan garis. Karena itu setiap goresan
 * (polyline) diubah lebih dulu menjadi bentuk tertutup tipis (`strokeToRibbon`) —
 * hasil render-nya tetap terlihat seperti ikon garis, tapi bisa dianimasikan.
 *
 * Syarat agar morph-nya bersih: semua glif harus punya jumlah goresan dan jumlah
 * titik yang sama (di sini 5 goresan × 5 titik), supaya tiap titik punya pasangan.
 */

export type Polyline = [number, number][]

const GLYPH_STROKES = 5
const GLYPH_POINTS = 5

export const ICON_STROKE_THICKNESS = 1.7

/** Goresan kosong (titik kembar) — dipakai bila sebuah glif butuh lebih sedikit goresan. */
const emptyStroke = (x: number, y: number): Polyline => Array.from({ length: GLYPH_POINTS }, () => [x, y] as [number, number])

const round = (value: number) => Math.round(value * 100) / 100

/**
 * Mengubah goresan (polyline) menjadi bentuk tertutup setebal `thickness`.
 * Tiap titik digeser tegak lurus arah goresan, lalu sisi kiri & kanan disatukan.
 */
export function strokeToRibbon(points: Polyline, thickness: number = ICON_STROKE_THICKNESS): string {
  const half = thickness / 2

  const normals = points.map((_, index) => {
    const previous = points[Math.max(0, index - 1)]
    const next = points[Math.min(points.length - 1, index + 1)]
    const dx = next[0] - previous[0]
    const dy = next[1] - previous[1]
    const length = Math.hypot(dx, dy) || 1
    return [-dy / length, dx / length] as [number, number]
  })

  const leftSide = points.map(([x, y], index) => [
    x + normals[index][0] * half,
    y + normals[index][1] * half,
  ])
  const rightSide = points.map(([x, y], index) => [
    x - normals[index][0] * half,
    y - normals[index][1] * half,
  ])

  const ring = [...leftSide, ...rightSide.reverse()]
  return `M${ring.map(([x, y]) => `${round(x)},${round(y)}`).join(" L")} Z`
}

/** institusi → kerja sama industri → teaching factory → siswa/lulusan */
export const bludIconGlyphs: Polyline[][] = [
  // 0 — bangunan institusi (atap + tiga kolom)
  [
    [[2, 10], [7, 6], [17, 6], [22, 10], [22, 10]],
    [[3, 12], [9, 12], [15, 12], [21, 12], [21, 12]],
    [[6, 12], [6, 15], [6, 18], [6, 21], [6, 21]],
    [[12, 12], [12, 15], [12, 18], [12, 21], [12, 21]],
    [[18, 12], [18, 15], [18, 18], [18, 21], [18, 21]],
  ],
  // 1 — koper kerja sama
  [
    [[9, 7], [9, 4], [15, 4], [15, 7], [15, 7]],
    [[3, 8], [9, 8], [15, 8], [21, 8], [21, 8]],
    [[3, 8], [3, 13], [3, 17], [3, 21], [3, 21]],
    [[21, 8], [21, 13], [21, 17], [21, 21], [21, 21]],
    [[3, 21], [9, 21], [15, 21], [21, 21], [21, 21]],
  ],
  // 2 — pabrik teaching factory (bercecerobong)
  [
    [[5, 3], [5, 5.5], [5, 8], [5, 10], [5, 10]],
    [[3, 10], [9, 10], [15, 10], [21, 10], [21, 10]],
    [[3, 10], [3, 13], [3, 17], [3, 21], [3, 21]],
    [[21, 10], [21, 13], [21, 17], [21, 21], [21, 21]],
    [[3, 21], [9, 21], [15, 21], [21, 21], [21, 21]],
  ],
  // 3 — topi wisuda (papan + kepala + tali)
  [
    [[2, 10], [12, 5], [22, 10], [12, 15], [2, 10]],
    [[9, 15], [9, 19.5], [15, 19.5], [15, 15], [9, 15]],
    [[18, 10], [19, 12], [19, 14], [19, 16], [19, 18]],
    emptyStroke(6, 10),
    emptyStroke(12, 12),
  ],
]

/** Bentuk siap-morph: setiap glif berupa daftar subpath (satu per goresan). */
export const bludIconShapes: string[][] = bludIconGlyphs.map((glyph) =>
  glyph.slice(0, GLYPH_STROKES).map((stroke) => strokeToRibbon(stroke)),
)
