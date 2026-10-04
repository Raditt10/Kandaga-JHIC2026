-- Selaraskan hasil migrasi dengan prisma/schema.prisma.
--
-- LATAR BELAKANG
-- Database pengembangan dibangun memakai `prisma db push`, sehingga tabel
-- `_prisma_migrations` tidak pernah ada dan riwayat migrasi tidak pernah
-- lengkap. Akibatnya, `prisma migrate deploy` ke database KOSONG (yaitu
-- produksi) menghasilkan skema yang BERBEDA dari schema.prisma pada 4 tabel.
-- Migrasi ini menutup selisih tersebut.
--
-- Selisih yang diperbaiki (terverifikasi lewat `prisma migrate diff` antara
-- database hasil `migrate deploy` vs schema.prisma):
--   1. badges.badge_name  -> badges.username   (schema: name @map("username"))
--   2. partnerships.isVerified                 (dihapus, tidak ada di schema)
--   3. projects.projectType                    (ditambahkan, sengaja dipertahankan)
--   4. projects.score                          (ditambahkan, nilai kurasi guru)
--   5. teachers.bio                            (dihapus, tidak ada di schema)
--
-- Catatan: kolom badges di-rename (bukan drop lalu add) supaya baris yang
-- sudah ada tidak hilang dan tidak melanggar NOT NULL.

-- 1. badges: badge_name -> username
DROP INDEX IF EXISTS "badges_badge_name_key";
ALTER TABLE "badges" RENAME COLUMN "badge_name" TO "username";
CREATE UNIQUE INDEX "badges_username_key" ON "badges"("username");

-- 2. partnerships: buang kolom yang tidak ada di schema
ALTER TABLE "partnerships" DROP COLUMN IF EXISTS "isVerified";

-- 3. projects: tambahkan kolom yang hilang
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "projectType" "ProjectType";
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "score" INTEGER;

-- 4. teachers: buang kolom yang tidak ada di schema
ALTER TABLE "teachers" DROP COLUMN IF EXISTS "bio";
