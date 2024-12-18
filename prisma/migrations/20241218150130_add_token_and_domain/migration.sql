/*
  Warnings:

  - Added the required column `hasDomain` to the `WalletData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokens` to the `WalletData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalletData" ADD COLUMN     "hasDomain" BOOLEAN NOT NULL,
ADD COLUMN     "tokens" TEXT NOT NULL;
