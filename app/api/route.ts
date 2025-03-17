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
const primsa = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address")!;

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
}

async function processAddress(address: string) {
  try {
    const tokensPromise = getTokens(address);
    const domainsPromise = getDomains(address);

    const txDataArray = await getTransactionDune(address);
    const txData = txDataArray.flat();

    const [tokens, domains] = await Promise.all([
      tokensPromise,
      domainsPromise,
    ]);

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

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json(
      { err: "Error fetching transactions" },
      { status: 500 },
    );
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
