/*
  Warnings:

  - You are about to drop the column `currentStreak` on the `WalletData` table. All the data in the column will be lost.
  - You are about to drop the column `currentStreakDates` on the `WalletData` table. All the data in the column will be lost.
  - You are about to drop the column `longestStreak` on the `WalletData` table. All the data in the column will be lost.
  - You are about to drop the column `longestStreakDates` on the `WalletData` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueDays` on the `WalletData` table. All the data in the column will be lost.
  - Added the required column `score` to the `WalletData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stats` to the `WalletData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalletData" DROP COLUMN "currentStreak",
DROP COLUMN "currentStreakDates",
DROP COLUMN "longestStreak",
DROP COLUMN "longestStreakDates",
DROP COLUMN "uniqueDays",
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "stats" TEXT NOT NULL;
