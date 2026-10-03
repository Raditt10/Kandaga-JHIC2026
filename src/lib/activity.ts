/**
 * Helper notifikasi & audit log.
 *
 * Sebelumnya tabel `notifications` dan `audit_logs` hanya pernah di-`deleteMany`
 * di seed — tidak ada satu pun kode yang mengisinya, padahal UI sudah
 * menjanjikan notifikasi (lihat /mitra/daftar dan /student).
 *
 * Kedua fungsi di sini SENGAJA menelan error sendiri: kegagalan menulis
 * notifikasi tidak boleh menggagalkan aksi utama (approve karya, teruskan
 * permintaan, dan seterusnya).
 */

import prisma from "@/lib/prisma"

export type NotificationInput = {
  userId: string | null | undefined
  /** Kelompok notifikasi: "karya" | "kontak" | "verifikasi" | "sistem" */
  type: string
  title: string
  content: string
}

/** Kirim satu atau banyak notifikasi sekaligus. */
export async function notify(input: NotificationInput | NotificationInput[]): Promise<void> {
  const list = (Array.isArray(input) ? input : [input]).filter((n) => Boolean(n.userId))
  if (list.length === 0) return

  try {
    await prisma.notifications.createMany({
      data: list.map((n) => ({
        userId: n.userId as string,
        type: n.type,
        title: n.title,
        content: n.content,
      })),
    })
  } catch (error) {
    console.error("[notify] gagal menyimpan notifikasi:", error)
  }
}

/** Catat aksi penting ke audit_logs. */
export async function audit(entry: {
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  data?: Record<string, unknown>
}): Promise<void> {
  try {
    await prisma.auditLogs.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        data: (entry.data ?? undefined) as never,
      },
    })
  } catch (error) {
    console.error("[audit] gagal menyimpan audit log:", error)
  }
}
