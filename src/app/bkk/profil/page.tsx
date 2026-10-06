"use client"

import React from "react"
import BKKLayout from "@/components/bkk/BKKLayout"
import BKKProfileView from "@/components/profile/BKKProfileView"

export default function BkkProfilPage() {
  return (
    <BKKLayout pageTitle="Profil Koordinator BKK">
      <BKKProfileView />
    </BKKLayout>
  )
}
