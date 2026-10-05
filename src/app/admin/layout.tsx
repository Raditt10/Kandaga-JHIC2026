import { cookies } from "next/headers"
import AdminLayout from "@/components/admin/AdminLayout"

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isCollapsed = cookieStore.get("kandaga_sidebar_collapsed")?.value === "true"

  return <AdminLayout initialCollapsed={isCollapsed}>{children}</AdminLayout>
}
