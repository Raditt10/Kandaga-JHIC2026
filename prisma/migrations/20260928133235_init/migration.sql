-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

-- CreateTable
CREATE TABLE "roles" (
    "id" SMALLINT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" SMALLINT NOT NULL,
    "username" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "majors" (
    "id" SMALLSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "user_id" UUID NOT NULL,
    "major_id" SMALLINT NOT NULL,
    "nis" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "generation" SMALLINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "bio" TEXT,
    "currentCareer" TEXT,
    "photo_url" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "user_id" UUID NOT NULL,
    "majors_id" SMALLINT NOT NULL,
    "nip" TEXT,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "companies" (
    "user_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "field" TEXT,
    "document_url" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "creationtypes" (
    "id" SMALLSERIAL NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "creationtypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools_skills" (
    "id" SMALLSERIAL NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "tools_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SMALLSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "tier" TEXT NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "students_id" UUID NOT NULL,
    "teachers_advisors_id" UUID,
    "creationtypes_id" SMALLINT,
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

    CONSTRAINT "creations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creations_media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creation_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "mediatype" TEXT NOT NULL DEFAULT 'photo',
    "orders" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "creations_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creation_tools" (
    "creation_id" UUID NOT NULL,
    "tool_id" SMALLINT NOT NULL,

    CONSTRAINT "creation_tools_pkey" PRIMARY KEY ("creation_id","tool_id")
);

-- CreateTable
CREATE TABLE "creations_badge" (
    "creation_id" UUID NOT NULL,
    "badge_id" SMALLINT NOT NULL,
    "given_from" UUID NOT NULL,
    "given_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creations_badge_pkey" PRIMARY KEY ("creation_id","badge_id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "creation_id" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "bkk_notes" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "company_id" UUID NOT NULL,
    "creation_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("company_id","creation_id")
);

-- CreateTable
CREATE TABLE "partnerships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "start_date" DATE,
    "notes" TEXT,
    "recorded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "data" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_username_key" ON "roles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "majors_code_key" ON "majors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "majors_name_key" ON "majors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "students_nis_key" ON "students"("nis");

-- CreateIndex
CREATE INDEX "students_majors_idx" ON "students"("major_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_nip_key" ON "teachers"("nip");

-- CreateIndex
CREATE INDEX "teachers_majors_idx" ON "teachers"("majors_id");

-- CreateIndex
CREATE UNIQUE INDEX "creationtypes_username_key" ON "creationtypes"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tools_skills_username_key" ON "tools_skills"("username");

-- CreateIndex
CREATE UNIQUE INDEX "badges_username_key" ON "badges"("username");

-- CreateIndex
CREATE UNIQUE INDEX "badges_tier_key" ON "badges"("tier");

-- CreateIndex
CREATE INDEX "creations_students_idx" ON "creations"("students_id");

-- CreateIndex
CREATE INDEX "creations_advisors_idx" ON "creations"("teachers_advisors_id");

-- CreateIndex
CREATE INDEX "creations_creationtypes_idx" ON "creations"("creationtypes_id");

-- CreateIndex
CREATE UNIQUE INDEX "creations_media_creation_id_orders_key" ON "creations_media"("creation_id", "orders");

-- CreateIndex
CREATE INDEX "creations_badge_idx" ON "creations_badge"("badge_id");

-- CreateIndex
CREATE INDEX "pk_status_idx" ON "contact_requests"("status");

-- CreateIndex
CREATE INDEX "pk_companies_idx" ON "contact_requests"("company_id");

-- CreateIndex
CREATE INDEX "pk_creations_idx" ON "contact_requests"("creation_id");

-- CreateIndex
CREATE UNIQUE INDEX "partnerships_request_id_key" ON "partnerships"("request_id");

-- CreateIndex
CREATE INDEX "notification_user_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "audit_entity_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_time_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_majors_id_fkey" FOREIGN KEY ("majors_id") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_students_id_fkey" FOREIGN KEY ("students_id") REFERENCES "students"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_teachers_advisors_id_fkey" FOREIGN KEY ("teachers_advisors_id") REFERENCES "teachers"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_creationtypes_id_fkey" FOREIGN KEY ("creationtypes_id") REFERENCES "creationtypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations" ADD CONSTRAINT "creations_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations_media" ADD CONSTRAINT "creations_media_creation_id_fkey" FOREIGN KEY ("creation_id") REFERENCES "creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creation_tools" ADD CONSTRAINT "creation_tools_creation_id_fkey" FOREIGN KEY ("creation_id") REFERENCES "creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creation_tools" ADD CONSTRAINT "creation_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools_skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations_badge" ADD CONSTRAINT "creations_badge_creation_id_fkey" FOREIGN KEY ("creation_id") REFERENCES "creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations_badge" ADD CONSTRAINT "creations_badge_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creations_badge" ADD CONSTRAINT "creations_badge_given_from_fkey" FOREIGN KEY ("given_from") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_creation_id_fkey" FOREIGN KEY ("creation_id") REFERENCES "creations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_creation_id_fkey" FOREIGN KEY ("creation_id") REFERENCES "creations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "contact_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
