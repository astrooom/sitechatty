/*
  Warnings:

  - You are about to alter the column `password_hash` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `VarChar(60)`.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password_hash" SET DATA TYPE VARCHAR(60);
