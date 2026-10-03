/*
  Warnings:

  - You are about to drop the column `username` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `projectType` on the `projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[badge_name]` on the table `badges` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `badge_name` to the `badges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tool_name` to the `project_tools` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "badges_username_key";

-- AlterTable
ALTER TABLE "badges" DROP COLUMN "username",
ADD COLUMN     "badge_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project_tools" ADD COLUMN     "tool_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "projectType",
ADD COLUMN     "cover_image" TEXT,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stars" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "projects_main_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "feature" TEXT NOT NULL,

    CONSTRAINT "projects_main_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_main_features_project_id_feature_key" ON "projects_main_features"("project_id", "feature");

-- CreateIndex
CREATE UNIQUE INDEX "badges_badge_name_key" ON "badges"("badge_name");

-- AddForeignKey
ALTER TABLE "projects_main_features" ADD CONSTRAINT "projects_main_features_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
