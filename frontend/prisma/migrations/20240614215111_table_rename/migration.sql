/*
  Warnings:

  - You are about to drop the `alembic_version` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `site` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `site_added_sources` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "site" DROP CONSTRAINT "site_user_id_fkey";

-- DropForeignKey
ALTER TABLE "site_added_sources" DROP CONSTRAINT "site_added_sources_site_id_fkey";

-- DropTable
DROP TABLE "alembic_version";

-- DropTable
DROP TABLE "site";

-- DropTable
DROP TABLE "site_added_sources";

-- DropTable
DROP TABLE "user";

-- DropEnum
DROP TYPE "sourcetypeenum";

-- CreateTable
CREATE TABLE "Sites" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "favicon_url" TEXT,
    "max_urls_allowed" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "Sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAddedSources" (
    "id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "source" VARCHAR(80) NOT NULL,
    "source_type" VARCHAR(80) NOT NULL,
    "type" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAddedSources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password_hash" VARCHAR(256) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "max_sites" INTEGER DEFAULT 1,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sites_name_key" ON "Sites"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SiteAddedSources_source_key" ON "SiteAddedSources"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Sites" ADD CONSTRAINT "Sites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteAddedSources" ADD CONSTRAINT "SiteAddedSources_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
