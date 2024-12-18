-- CreateTable
CREATE TABLE "WalletData" (
    "address" TEXT NOT NULL,
    "uniqueDays" INTEGER NOT NULL,
    "longestStreak" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL,
    "longestStreakDates" TEXT,
    "currentStreakDates" TEXT,
    "fee" BIGINT NOT NULL,
    "totalTransactions" INTEGER NOT NULL,

    CONSTRAINT "WalletData_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "TxData" (
    "id" TEXT NOT NULL,
    "fee" BIGINT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "programIds" TEXT[],
    "walletAddress" TEXT NOT NULL,

    CONSTRAINT "TxData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TxData" ADD CONSTRAINT "TxData_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "WalletData"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
