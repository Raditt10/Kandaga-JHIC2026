"use client"

/**
 * /company/pengaturan — pengaturan akun mitra perusahaan.
 *
 * Menyamakan kelima dashboard: sebelumnya hanya admin yang punya halaman
 * Pengaturan. Isi formulirnya memakai komponen bersama AccountSettings.
 */

import React from "react"
import CompanyLayout from "@/components/company/CompanyLayout"
import AccountSettings from "@/components/settings/AccountSettings"

export default function CompanyPengaturanPage() {
  return (
    <CompanyLayout>
      <AccountSettings />
    </CompanyLayout>
  )
}
