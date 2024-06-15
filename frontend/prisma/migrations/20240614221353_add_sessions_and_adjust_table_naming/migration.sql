/*
  Warnings:

  - You are about to drop the `SiteAddedSources` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SiteAddedSources" DROP CONSTRAINT "SiteAddedSources_site_id_fkey";

-- DropForeignKey
ALTER TABLE "Sites" DROP CONSTRAINT "Sites_user_id_fkey";

-- DropTable
DROP TABLE "SiteAddedSources";

-- DropTable
DROP TABLE "Sites";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" VARCHAR(60) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "max_sites" INTEGER DEFAULT 1,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "favicon_url" TEXT,
    "max_urls_allowed" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAddedSource" (
    "id" SERIAL NOT NULL,
    "site_id" INTEGER NOT NULL,
    "source" VARCHAR(80) NOT NULL,
    "source_type" VARCHAR(80) NOT NULL,
    "type" VARCHAR(80),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "SiteAddedSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Site_name_key" ON "Site"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SiteAddedSource_source_key" ON "SiteAddedSource"("source");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteAddedSource" ADD CONSTRAINT "SiteAddedSource_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
