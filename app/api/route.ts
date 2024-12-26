import { countProgramIds, ProgramIdDetailedCount } from "@/lib/program";
import { getSignatures } from "@/lib/sign";
import { analyzeTransactionStreaks, StreakAnalysis } from "@/lib/time";
import { getTransaction } from "@/lib/transaction";
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

let signatures_length = 0;
const processingQueue: string[] = [];
let isProcessing = false;

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
    }
  } catch (err) {
    console.log("Error fetching data from DB", err);
  }

  if (processingQueue.includes(address)) {
    return NextResponse.json(
      {
        message: "Your request is being processed. Please wait a moment.",
        length: processingQueue.length,
        position: processingQueue.indexOf(address) + 1,
        signatures: signatures_length,
      },
      { status: 203 },
    );
  }
  processingQueue.push(address);
  processAddress();

  return NextResponse.json(
    {
      message: "Your request has been queued. Processing will begin shortly.",
      length: processingQueue.length,
      position: processingQueue.indexOf(address) + 1,
    },
    { status: 202 },
  );
}

async function processAddress() {
  if (isProcessing || processingQueue.length === 0) return;

  isProcessing = true;
  const address = processingQueue.shift()!;

  try {
    const signatures = await getSignatures(address);
    if (signatures.length > 15000) {
      return (
        NextResponse.json({
          err: "You have more than 15000 transasctions. Please enter the wallet you dialy use not the bot accounts and programs.",
        }),
        { status: 400 }
      );
    }
    signatures_length = signatures.length;
    const tokensPromise = getTokens(address);
    const domainsPromise = getDomains(address);

    const processBatch = async (
      signatures: ConfirmedSignatureInfo[],
      batchSize = 100,
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
          console.log(
            `Processed batch ${i / batchSize + 1}, waiting 1 seconds...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      return txData;
    };

    const txData = await processBatch(signatures);

    const [tokens, domains] = await Promise.all([
      tokensPromise,
      domainsPromise,
    ]);

    const programIds_time = txData
      .filter((tx) => tx.time !== 0)
      .map((tx) => ({
        time: tx.time,
        programId: Array.from(new Set(tx.programIds)),
      }));

    const timestamp = programIds_time.map((item) => item.time);
    const stats = analyzeTransactionStreaks(timestamp);

    const validTxData = txData.filter((tx) => tx.time !== 0);
    const fee = validTxData.reduce((sum, tx) => sum + tx.fee, 0);
    const programIdCountMap = countProgramIds(programIds_time);
    const totaltx = validTxData.length;

    let score = onchainScore(
      totaltx,
      stats,
      programIdCountMap,
      tokens,
      domains,
    );

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
    const idx = processingQueue.indexOf(address);
    if (idx > -1) {
      processingQueue.splice(idx, 1);
    }
    signatures_length = 0;
    return NextResponse.json(
      { err: "Error fetching transactions" },
      { status: 500 },
    );
  } finally {
    const idx = processingQueue.indexOf(address);
    if (idx > -1) {
      processingQueue.splice(idx, 1);
    }
    isProcessing = false;
    signatures_length = 0;
    if (processingQueue.length > 0) {
      processAddress();
    }
  }
}
