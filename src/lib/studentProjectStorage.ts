"use client";

import { GALLERY_PROJECTS, GalleryProjectItem, STUDENT_PROFILES } from "@/data/galleryData";

const STORAGE_KEY = "kandaga_custom_projects";
const DELETED_KEY = "kandaga_deleted_projects";

/**
 * Mendapatkan daftar proyek kustom/edisi siswa dari LocalStorage (jika ada).
 */
function getStoredCustomProjects(): GalleryProjectItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Mendapatkan daftar ID proyek yang dihapus oleh siswa.
 */
function getStoredDeletedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCustomProjects(projects: GalleryProjectItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event("kandaga_projects_updated"));
  } catch (err) {
    console.error("Gagal menyimpan proyek ke storage:", err);
  }
}

function saveDeletedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("kandaga_projects_updated"));
  } catch (err) {
    console.error("Gagal menyimpan id terhapus:", err);
  }
}

/**
 * Mengambil semua proyek gabungan (seed data + kustom pengguna - terhapus),
 * diurutkan berdasarkan createdAt (terbaru di atas).
 */
export function getAllProjects(): GalleryProjectItem[] {
  const customProjects = getStoredCustomProjects();
  const deletedIds = new Set(getStoredDeletedIds());

  // Buat map dari seed data dengan timestamp default jika belum ada
  const seedWithDates: GalleryProjectItem[] = GALLERY_PROJECTS.map((p, idx) => ({
    ...p,
    isPrivate: p.isPrivate ?? false,
    createdAt:
      p.createdAt ||
      new Date(Date.now() - (idx + 1) * 86400000 * 7).toISOString(),
  }));

  // Map gabungan dengan ID sebagai kunci (custom overrides seed)
  const projectMap = new Map<string, GalleryProjectItem>();

  for (const item of seedWithDates) {
    if (!deletedIds.has(item.id)) {
      projectMap.set(item.id, item);
    }
  }

  for (const item of customProjects) {
    if (!deletedIds.has(item.id)) {
      projectMap.set(item.id, item);
    }
  }

  const all = Array.from(projectMap.values());
  all.sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return all;
}

/**
 * Mengambil proyek milik siswa tertentu, diurutkan berdasarkan createdAt terbaru.
 */
export function getStudentProjects(studentId: string): GalleryProjectItem[] {
  const all = getAllProjects();
  return all.filter((p) => p.studentId === studentId);
}

/**
 * Mencari proyek berdasarkan ID.
 */
export function getProjectById(id: string): GalleryProjectItem | undefined {
  const all = getAllProjects();
  return all.find((p) => p.id === id);
}

/**
 * Membuat karya baru dan menyimpannya.
 */
export function createProject(
  payload: Omit<
    GalleryProjectItem,
    "id" | "createdAt" | "updatedAt" | "metrics"
  > & {
    id?: string;
  }
): GalleryProjectItem {
  const customProjects = getStoredCustomProjects();

  const id =
    payload.id ||
    payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

  const studentProfile = STUDENT_PROFILES[payload.studentId];

  const newProject: GalleryProjectItem = {
    ...payload,
    id,
    major: payload.major,
    majorLabel: payload.majorLabel || payload.major.toUpperCase(),
    jurusan: payload.major,
    jurusanLabel: payload.majorLabel || payload.major.toUpperCase(),
    status: payload.status || "pending",
    isPrivate: payload.isPrivate ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    studentName: payload.studentName || studentProfile?.name || "Farhan Maulana",
    studentAvatar:
      payload.studentAvatar ||
      studentProfile?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    studentClass: payload.studentClass || studentProfile?.class || "XII RPL 1",
    isStudentPrivate: studentProfile?.isPrivate ?? false,
    metrics: {
      views: 1,
      likes: 0,
    },
    advisor: payload.advisor || {
      name: "Drs. M. Taufik, M.T.",
      role: "Guru Pembimbing Kurasi",
      reviewNotes: "Karya baru diajukan oleh siswa dan siap masuk proses kurasi portofolio.",
    },
  };

  const updated = [newProject, ...customProjects.filter((p) => p.id !== id)];
  saveCustomProjects(updated);

  return newProject;
}

/**
 * Memperbarui proyek yang sudah ada.
 */
export function updateProject(
  id: string,
  updates: Partial<GalleryProjectItem>
): GalleryProjectItem | null {
  const existing = getProjectById(id);
  if (!existing) return null;

  const updatedItem: GalleryProjectItem = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const customProjects = getStoredCustomProjects();
  const index = customProjects.findIndex((p) => p.id === id);

  if (index >= 0) {
    customProjects[index] = updatedItem;
    saveCustomProjects(customProjects);
  } else {
    // Proyek berasal dari seed data, tambahkan ke kustom sebagai override
    saveCustomProjects([updatedItem, ...customProjects]);
  }

  return updatedItem;
}

/**
 * Mengubah status visibilitas (Publik <=> Privat).
 */
export function toggleProjectVisibility(id: string): GalleryProjectItem | null {
  const project = getProjectById(id);
  if (!project) return null;

  const nextState = !project.isPrivate;
  return updateProject(id, { isPrivate: nextState });
}

/**
 * Menghapus proyek karya siswa.
 */
export function deleteProject(id: string): boolean {
  const customProjects = getStoredCustomProjects();
  const deletedIds = getStoredDeletedIds();

  // Hapus dari custom
  const filtered = customProjects.filter((p) => p.id !== id);
  saveCustomProjects(filtered);

  // Tandai di deletedIds agar seed data juga terhapus
  if (!deletedIds.includes(id)) {
    saveDeletedIds([...deletedIds, id]);
  }

  return true;
}
