import { countProgramIds } from "@/lib/program";
import { getSignatures } from "@/lib/sign";
import { analyzeTransactionStreaks } from "@/lib/time";
import { getTransaction } from "@/lib/transaction";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokens } from "@/lib/token";
import { getDomains } from "@/lib/domain";
import onchainScore from "@/lib/score";

interface txData {
  fee: number;
  time: number;
  programIds: string[];
}
const primsa = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address")!;
  
  const startTime = Date.now();
  try {
    const signatures = await getSignatures(address);

    const tokensPromise = getTokens(address);
    const domainsPromise = getDomains(address);

    const processBatch = async (signatures: any[], batchSize = 10) => {
      const txData: txData[] = [];

      for (let i = 0; i < signatures.length; i += batchSize) {
        const batch = signatures.slice(i, i + batchSize);
        const batchPromises = batch.map((sig) =>
          getTransaction(sig.signature, address)
        );
        const batchResults = await Promise.all(batchPromises);
        txData.push(...batchResults);

        if (i + batchSize < signatures.length) {
          console.log(
            `Processed batch ${i / batchSize + 1}, waiting 1 seconds...`
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

    const endTime = Date.now();
    console.log(`Time taken: ${endTime - startTime}ms`);

    // primsa.walletData.create({
    //   data: {
    //     address: address,
    //     uniqueDays: stats.uniqueDays,
    //     longestStreak: stats.longestStreak,
    //     currentStreak: stats.currentStreak,
    //     longestStreakDates: JSON.stringify(stats.longestStreakDates),
    //     currentStreakDates: JSON.stringify(stats.currentStreakDates),
    //     fee,
    //     totalTransactions: totaltx,
    //     programId: JSON.stringify(programIdCountMap),
    //     txData:  JSON.stringify(txData),
    //     tokens: JSON.stringify(tokens, (key, value) =>
    //       typeof value === "bigint" ? value.toString() : value
    //     ),
    //     hasDomain: domains,
    //   },
    // });

    let score = onchainScore(totaltx, stats, programIdCountMap, tokens);
    if (domains) score += 5;
    if (score > 85) score += 5;

    return NextResponse.json({
      score,
      stats,
      fee,
      totaltx,
      programIdCountMap,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json(
      { err: "Error fetching transactions" },
      { status: 500 }
    );
  }
}
