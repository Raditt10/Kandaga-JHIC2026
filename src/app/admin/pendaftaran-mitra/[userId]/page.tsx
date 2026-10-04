"use client"

import { use } from "react"
import MitraReviewView, { rekrutmenReviewOrigin } from "@/components/admin/MitraReviewView"

interface PageProps {
  params: Promise<{ userId: string }>
}

/**
 * Halaman khusus review permohonan rekrutmen PKL/magang dari menu
 * Pendaftaran Mitra. Tampilan review dipakai bersama dengan BKK
 * (@/components/admin/MitraReviewView) — satu sumber logika keputusan.
 */
export default function AdminPendaftaranMitraReviewPage({ params }: PageProps) {
  const { userId } = use(params)

  return <MitraReviewView userId={userId} origin={rekrutmenReviewOrigin} />
}
