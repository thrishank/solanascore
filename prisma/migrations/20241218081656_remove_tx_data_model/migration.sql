/*
  Warnings:

  - You are about to drop the `TxData` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `txData` to the `WalletData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TxData" DROP CONSTRAINT "TxData_walletAddress_fkey";

-- AlterTable
ALTER TABLE "WalletData" ADD COLUMN     "txData" TEXT NOT NULL;

-- DropTable
DROP TABLE "TxData";
