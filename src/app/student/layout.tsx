import { cookies } from "next/headers"
import { SidebarPreferenceProvider } from "@/components/dashboard/SidebarPreferenceProvider"

/**
 * Layout akar dashboard Siswa.
 *
 * Satu-satunya tugasnya: membaca preferensi lipat sidebar dari cookie
 * `kandaga_sidebar_collapsed` DI SERVER, lalu menitipkannya ke `DashboardShell`
 * lewat context.
 *
 * Tanpa ini, HTML server selalu tercetak dengan sidebar terbuka, dan klien
 * baru mengoreksinya setelah hidup — terlihat sebagai sidebar yang beranimasi
 * mengempis setiap kali halaman dimuat ulang. Halaman-halaman di bawah
 * `/student` adalah komponen klien, jadi hanya layout server inilah yang bisa
 * membaca cookie sebelum render pertama.
 *
 * Pola ini sama dengan `app/admin/layout.tsx`. Efek sampingnya: rute di bawah
 * `/student` dirender per-permintaan (dinamis), bukan diprerender statis.
 */
export default async function StudentRootLayout({
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
