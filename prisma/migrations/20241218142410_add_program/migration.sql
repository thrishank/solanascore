/*
  Warnings:

  - Added the required column `programId` to the `WalletData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalletData" ADD COLUMN     "programId" TEXT NOT NULL;
