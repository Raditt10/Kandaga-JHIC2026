"use client"

import { use } from "react"
import MitraReviewView, { bkkReviewOrigin } from "@/components/admin/MitraReviewView"

interface PageProps {
  params: Promise<{ userId: string }>
}

/**
 * Halaman review pengajuan mitra dari menu BKK.
 * Tampilan review dipakai bersama di @/components/admin/MitraReviewView.
 */
export default function AdminBkkReviewPage({ params }: PageProps) {
  const { userId } = use(params)

  return <MitraReviewView userId={userId} origin={bkkReviewOrigin} />
}
