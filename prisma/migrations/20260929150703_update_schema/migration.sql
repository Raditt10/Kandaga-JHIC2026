/*
  Warnings:

  - The primary key for the `bookmarks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `creation_id` on the `bookmarks` table. All the data in the column will be lost.
  - You are about to drop the column `creation_id` on the `contact_requests` table. All the data in the column will be lost.
  - The primary key for the `majors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `majors` table. All the data in the column will be lost.
  - The `id` column on the `majors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `creation_tools` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `creations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `creations_badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `creations_media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `creationtypes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `project_id` to the `bookmarks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `contact_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `majors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `majors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `majors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `majors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Student', 'Teacher', 'Company', 'Admin', 'BKK');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('RPL', 'TKJ', 'KA');

-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_creation_id_fkey";

-- DropForeignKey
ALTER TABLE "contact_requests" DROP CONSTRAINT "contact_requests_creation_id_fkey";

-- DropForeignKey
ALTER TABLE "creation_tools" DROP CONSTRAINT "creation_tools_creation_id_fkey";

-- DropForeignKey
ALTER TABLE "creation_tools" DROP CONSTRAINT "creation_tools_tool_id_fkey";

-- DropForeignKey
ALTER TABLE "creations" DROP CONSTRAINT "creations_creationtypes_id_fkey";

-- DropForeignKey
ALTER TABLE "creations" DROP CONSTRAINT "creations_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "creations" DROP CONSTRAINT "creations_students_id_fkey";

-- DropForeignKey
ALTER TABLE "creations" DROP CONSTRAINT "creations_teachers_advisors_id_fkey";

-- DropForeignKey
ALTER TABLE "creations_badge" DROP CONSTRAINT "creations_badge_badge_id_fkey";

-- DropForeignKey
ALTER TABLE "creations_badge" DROP CONSTRAINT "creations_badge_creation_id_fkey";

-- DropForeignKey
ALTER TABLE "creations_badge" DROP CONSTRAINT "creations_badge_given_from_fkey";

-- DropForeignKey
ALTER TABLE "creations_media" DROP CONSTRAINT "creations_media_creation_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_major_id_fkey";

-- DropForeignKey
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_majors_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropIndex
DROP INDEX "pk_creations_idx";

-- DropIndex
DROP INDEX "majors_code_key";

-- DropIndex
DROP INDEX "users_role_idx";

-- AlterTable
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_pkey",
DROP COLUMN "creation_id",
ADD COLUMN     "project_id" UUID NOT NULL,
ADD CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("company_id", "project_id");

-- AlterTable
ALTER TABLE "contact_requests" DROP COLUMN "creation_id",
ADD COLUMN     "project_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "majors" DROP CONSTRAINT "majors_pkey",
DROP COLUMN "code",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "majors_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "major_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "teachers" ALTER COLUMN "majors_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropTable
DROP TABLE "creation_tools";

-- DropTable
DROP TABLE "creations";

-- DropTable
DROP TABLE "creations_badge";

-- DropTable
DROP TABLE "creations_media";

-- DropTable
DROP TABLE "creationtypes";

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "students_id" UUID NOT NULL,
    "teacher_advisors_id" UUID,
    "project_types" "ProjectType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" SMALLINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "review_notes" TEXT,
    "reviewed_by" UUID,
    "published_at" TIMESTAMPTZ,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "search_vector" tsvector,
    "projectType" "ProjectType",

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "mediatype" TEXT NOT NULL DEFAULT 'photo',
    "orders" SMALLINT DEFAULT 0,

    CONSTRAINT "projects_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tools" (
    "project_id" UUID NOT NULL,
    "tool_id" SMALLINT NOT NULL,

    CONSTRAINT "project_tools_pkey" PRIMARY KEY ("project_id","tool_id")
);

-- CreateTable
CREATE TABLE "projects_badge" (
    "project_id" UUID NOT NULL,
    "badge_id" SMALLINT NOT NULL,
    "given_from" UUID NOT NULL,
    "given_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_badge_pkey" PRIMARY KEY ("project_id","badge_id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "asker_id" UUID NOT NULL,
    "replier_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_students_idx" ON "projects"("students_id");

-- CreateIndex
CREATE INDEX "projects_advisors_idx" ON "projects"("teacher_advisors_id");

-- CreateIndex
CREATE INDEX "projects_search_vector_idx" ON "projects" USING GIN ("search_vector");

-- CreateIndex
CREATE UNIQUE INDEX "projects_media_project_id_orders_key" ON "projects_media"("project_id", "orders");

-- CreateIndex
CREATE INDEX "projects_badge_idx" ON "projects_badge"("badge_id");

-- CreateIndex
CREATE INDEX "pk_projects_idx" ON "contact_requests"("project_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_majors_id_fkey" FOREIGN KEY ("majors_id") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_students_id_fkey" FOREIGN KEY ("students_id") REFERENCES "students"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_teacher_advisors_id_fkey" FOREIGN KEY ("teacher_advisors_id") REFERENCES "teachers"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_media" ADD CONSTRAINT "projects_media_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tools" ADD CONSTRAINT "project_tools_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tools" ADD CONSTRAINT "project_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools_skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_badge" ADD CONSTRAINT "projects_badge_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_badge" ADD CONSTRAINT "projects_badge_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_badge" ADD CONSTRAINT "projects_badge_given_from_fkey" FOREIGN KEY ("given_from") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_asker_id_fkey" FOREIGN KEY ("asker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_replier_id_fkey" FOREIGN KEY ("replier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
