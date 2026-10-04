-- CreateTable
CREATE TABLE "internship_postings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "major_target" TEXT NOT NULL DEFAULT 'Semua',
    "type" TEXT NOT NULL DEFAULT 'Magang',
    "location" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'buka',
    "quota" TEXT,
    "deadline" TIMESTAMPTZ,
    "description" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_postings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "internship_status_idx" ON "internship_postings"("status");

-- CreateIndex
CREATE INDEX "internship_major_idx" ON "internship_postings"("major_target");

-- AddForeignKey
ALTER TABLE "internship_postings" ADD CONSTRAINT "internship_postings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
