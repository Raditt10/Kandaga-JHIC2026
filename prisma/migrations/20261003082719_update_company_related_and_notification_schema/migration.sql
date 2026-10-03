-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "employee_count" TEXT,
ADD COLUMN     "founded_year" SMALLINT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "nib" TEXT,
ADD COLUMN     "npwp" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pic_email" TEXT,
ADD COLUMN     "pic_name" TEXT,
ADD COLUMN     "pic_phone" TEXT,
ADD COLUMN     "pic_position" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "nis" DROP NOT NULL,
ALTER COLUMN "generation" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT,
ALTER COLUMN "role" SET DEFAULT 'Student';

-- CreateTable
CREATE TABLE "internship_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicant_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "student_id" UUID,
    "student_name" TEXT,
    "student_class" TEXT,
    "nis" TEXT,
    "major" TEXT,
    "cv_url" TEXT,
    "portfolio_url" TEXT,
    "company_id" UUID,
    "company_name" TEXT NOT NULL,
    "company_field" TEXT,
    "company_address" TEXT,
    "contact_person" TEXT,
    "position_title" TEXT NOT NULL,
    "required_major" TEXT,
    "quota" INTEGER DEFAULT 1,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "stipend" TEXT,
    "duration_months" INTEGER NOT NULL DEFAULT 3,
    "start_date" DATE,
    "end_date" DATE,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "bkk_notes" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_applications_pkey" PRIMARY KEY ("id")
);
