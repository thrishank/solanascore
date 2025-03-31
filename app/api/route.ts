import { countProgramIds, ProgramIdDetailedCount } from "@/lib/program";
import { analyzeTransactionStreaks, StreakAnalysis } from "@/lib/time";
import { getTransaction, getTransactionDune } from "@/lib/transaction";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokens } from "@/lib/token";
import { getDomains } from "@/lib/domain";
import onchainScore from "@/lib/score";
import { ConfirmedSignatureInfo } from "@solana/web3.js";

interface txData {
  fee: number;
  time: number;
  programIds: string[];
}

export interface ResponseData {
  score: number;
  stats: StreakAnalysis;
  fee: number;
  totaltx: number;
  programIdCountMap: ProgramIdDetailedCount[];
}

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const addr = url.searchParams.get("address")!;
  const address = addr.split(",");

  const emptyStreakAnalysis: StreakAnalysis = {
    uniqueDays: 0,
    longestStreak: 0,
    currentStreak: 0,
    counts: {},
    dayCount: [],
  };

  const data: ResponseData = {
    score: 0,
    fee: 0,
    totaltx: 0,
    stats: emptyStreakAnalysis,
    programIdCountMap: [],
  };

  for (const addr of address) {
    const db = await prisma.walletData.findUnique({
      where: {
        address: addr,
      },
    });

    if (db) {
      data.score += db.score;
      data.fee += Number(db.fee);
      data.totaltx += db.totalTransactions;
      data.stats = addStreakAnalysis(data.stats, JSON.parse(db.stats));
      data.programIdCountMap.push(JSON.parse(db.programId));
    }
    const processedData = await processAddress(addr);
    if (processedData) {
      if (data.score < processedData.score) data.score = processedData.score;
      data.fee += processedData.fee;
      data.totaltx += processedData.totaltx;
      data.stats = addStreakAnalysis(data.stats, processedData.stats);
      data.programIdCountMap.push(...processedData.programIdCountMap);
    }
  }

  return NextResponse.json(data, { status: 200 });

  /*
  try {
    const db = await primsa.walletData.findUnique({
      where: {
        address: address,
      },
    });
    if (db) {
      const data: ResponseData = {
        score: db.score,
        stats: JSON.parse(db.stats),
        fee: Number(db.fee),
        totaltx: db.totalTransactions,
        programIdCountMap: JSON.parse(db.programId),
      };
      console.log("Data from DB");
      return NextResponse.json(data, { status: 200 });
    } else {
      return await processAddress(address);
    }
  } catch (err) {
    console.log("Error fetching data from DB", err);
  }
  */
}

async function processAddress(address: string) {
  try {
    const domainsPromise = await getDomains(address);

    const tokensPromise = getTokens(address);

    const [tokens, domains] = await Promise.all([
      tokensPromise,
      domainsPromise,
    ]);
    const txDataArray = await getTransactionDune(address);
    const txData = txDataArray.flat();

    const timestamp = txData.map((item) => item.time);
    const stats = analyzeTransactionStreaks(timestamp);

    const fee = txData.reduce((sum, tx) => sum + tx.fee, 0);

    const programs = txData.map((tx) => {
      return {
        programId: tx.programIds,
        time: tx.time,
      };
    });

    const programIdCountMap = countProgramIds(programs);

    const totaltx = txData.length;

    let score = onchainScore(
      totaltx,
      stats,
      programIdCountMap,
      tokens,
      domains,
    );

    /* 
    await primsa.walletData.upsert({
      where: { address: address },
      update: {
        score: score,
        stats: JSON.stringify(stats),
        fee,
        totalTransactions: totaltx,
        programId: JSON.stringify(programIdCountMap),
        txData: JSON.stringify(txData),
        tokens: JSON.stringify(tokens, (_, value) =>
          typeof value === "bigint" ? value.toString() : value,
        ),
        hasDomain: domains,
      },
      create: {
        address: address,
        score: score,
        stats: JSON.stringify(stats),
        fee,
        totalTransactions: totaltx,
        programId: JSON.stringify(programIdCountMap),
        txData: JSON.stringify(txData),
        tokens: JSON.stringify(tokens, (_, value) =>
          typeof value === "bigint" ? value.toString() : value,
        ),
        hasDomain: domains,
      },
    });
    */

    const responseData: ResponseData = {
      score,
      stats,
      fee,
      totaltx,
      programIdCountMap,
    };

    return responseData;
  } catch (err) {
    console.error("Error fetching transactions:", err);
  }
}

const processBatch = async (
  signatures: ConfirmedSignatureInfo[],
  batchSize = 10,
  address: string,
) => {
  const txData: txData[] = [];

  for (let i = 0; i < signatures.length; i += batchSize) {
    const batch = signatures.slice(i, i + batchSize);
    const batchPromises = batch.map((sig) =>
      getTransaction(sig.signature, address),
    );
    const batchResults = await Promise.all(batchPromises);
    txData.push(...batchResults);

    if (i + batchSize < signatures.length) {
      console.log(`Processed batch ${i / batchSize + 1}, waiting 1 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return txData;
};

function addStreakAnalysis(
  a: StreakAnalysis,
  b: StreakAnalysis,
): StreakAnalysis {
  // Merge counts
  const mergedCounts: Record<number, number> = { ...a.counts };
  for (const [key, value] of Object.entries(b.counts)) {
    const numKey = Number(key);
    mergedCounts[numKey] = (mergedCounts[numKey] || 0) + value;
  }

  // Merge dayCount and sort by date
  const mergedDayCount = [...a.dayCount, ...b.dayCount].sort(
    (x, y) => new Date(x.date).getTime() - new Date(y.date).getTime(),
  );

  // Determine longest streak
  const longestStreak = Math.max(a.longestStreak, b.longestStreak);
  const longestStreakDates =
    longestStreak === a.longestStreak
      ? a.longestStreakDates
      : b.longestStreakDates;

  // Determine current streak
  let currentStreak = a.currentStreak;
  let currentStreakDates = a.currentStreakDates;

  if (b.currentStreakDates?.start && a.currentStreakDates?.end) {
    const aEndDate = new Date(a.currentStreakDates.end);
    const bStartDate = new Date(b.currentStreakDates.start);

    const isConsecutive =
      bStartDate.getTime() - aEndDate.getTime() === 86400000; // Difference of 1 day in ms

    if (isConsecutive) {
      currentStreak += b.currentStreak;
      currentStreakDates = {
        start: a.currentStreakDates.start,
        end: b.currentStreakDates.end,
      };
    } else if (b.currentStreak > a.currentStreak) {
      currentStreak = b.currentStreak;
      currentStreakDates = b.currentStreakDates;
    }
  }

  // Return the merged StreakAnalysis
  return {
    uniqueDays: a.uniqueDays + b.uniqueDays,
    longestStreak,
    currentStreak,
    longestStreakDates,
    currentStreakDates,
    counts: mergedCounts,
    dayCount: mergedDayCount,
  };
}
