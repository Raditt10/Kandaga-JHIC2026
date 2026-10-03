"use client"

/**
 * /bkk/pengaturan — pengaturan akun Koordinator BKK.
 *
 * Menyamakan kelima dashboard: sebelumnya hanya admin yang punya halaman
 * Pengaturan. Isi formulirnya memakai komponen bersama AccountSettings.
 */

import React from "react"
import BKKLayout from "@/components/bkk/BKKLayout"
import AccountSettings from "@/components/settings/AccountSettings"

export default function BkkPengaturanPage() {
  return (
    <BKKLayout pageTitle="Pengaturan">
      <AccountSettings />
    </BKKLayout>
  )
}
