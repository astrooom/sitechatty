-- CreateEnum
CREATE TYPE "sourcetypeenum" AS ENUM ('WEB', 'UPLOAD', 'INPUT');

-- CreateTable
CREATE TABLE "alembic_version" (
    "version_num" VARCHAR(32) NOT NULL,

    CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num")
);

-- CreateTable
CREATE TABLE "site" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "favicon_url" TEXT,
    "max_urls_allowed" INTEGER NOT NULL,

    CONSTRAINT "site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_added_sources" (
    "id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "source" VARCHAR(80) NOT NULL,
    "source_type" VARCHAR(80) NOT NULL,
    "type" VARCHAR(80),
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "site_added_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password_hash" VARCHAR(256) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "max_sites" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_name_key" ON "site"("name");

-- CreateIndex
CREATE UNIQUE INDEX "site_added_sources_source_key" ON "site_added_sources"("source");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "site" ADD CONSTRAINT "site_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "site_added_sources" ADD CONSTRAINT "site_added_sources_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
