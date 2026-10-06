import { cookies } from "next/headers"
import { SidebarPreferenceProvider } from "@/components/dashboard/SidebarPreferenceProvider"

/**
 * Layout akar dashboard Perusahaan.
 *
 * Membaca preferensi lipat sidebar dari cookie `kandaga_sidebar_collapsed` di
 * server supaya HTML pertama sudah tercetak dalam keadaan yang benar — lihat
 * penjelasan lengkap di `app/student/layout.tsx`.
 */
export default async function CompanyRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isCollapsed = cookieStore.get("kandaga_sidebar_collapsed")?.value === "true"

  return (
    <SidebarPreferenceProvider initialCollapsed={isCollapsed}>
      {children}
    </SidebarPreferenceProvider>
  )
}
