import { ConfirmedSignatureInfo, Connection, PublicKey } from "@solana/web3.js";
import { provider } from "./data";

export async function getSignatures(
  address: string
): Promise<ConfirmedSignatureInfo[]> {
  let signatures: ConfirmedSignatureInfo[] = [];

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  const oneYearAgo = Math.floor(Date.now() / 1000) - ONE_YEAR_IN_SECONDS;
 
  let oldestSignature: string | undefined;
  // 20
  while (true) {
    try {
      const newSignatures = await provider.getSignaturesForAddress(
        new PublicKey(address),
        {
          before: oldestSignature,
          limit: 1000,
        }
      );

      console.log(`Fetched ${newSignatures.length} signatures`);
      if (newSignatures.length === 0) break;

      let stopLoop = false;

      for (const sig of newSignatures) {
        if (sig.err === null) {
          if (sig.blockTime! < oneYearAgo) {
            stopLoop = true;
            break;
          }
          signatures.push(sig);
        }
      }

      oldestSignature = newSignatures[newSignatures.length - 1]?.signature;

      if (stopLoop) break;

      // await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error("Error fetching signatures:", err);
      break;
    }
  }

  return signatures;
  // const sign = await provider.getSignaturesForAddress(new PublicKey(address));
  // return sign;
}

export function processDates(dates: number[]) {
  const groupedDates = dates.reduce((acc: { [key: string]: number }, date) => {
    const formattedDate = epochToDate(date);
    acc[formattedDate] = (acc[formattedDate] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(groupedDates).map(([date, count]) => ({
    date,
    count,
  }));
}

function epochToDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}