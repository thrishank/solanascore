import { Connection, PublicKey } from "@solana/web3.js";

export async function getSignatures(address: string) {
  let oldestSignature;

  const dates: number[] = [];

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  const oneYearAgo = Math.floor(Date.now() / 1000) - ONE_YEAR_IN_SECONDS;
  const provider = new Connection("https://mainnet.helius-rpc.com/?api-key=");
  while (true) {
    try {
      const signatures = await provider.getSignaturesForAddress(
        new PublicKey(address),
        {
          before: oldestSignature,
          limit: 1000,
        }
      );
      if (signatures.length === 0) break;

      let stopLoop = false;

      for (const sig of signatures) {
        if (sig.blockTime) {
          if (sig.blockTime < oneYearAgo) {
            stopLoop = true;
            break;
          }
          dates.push(sig.blockTime);
        }
      }

      if (stopLoop) break;
      oldestSignature = signatures[signatures.length - 1].signature;

      // Add a delay of 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.log(err);
      break;
    }
  }
  return processDates(dates);
}

function processDates(dates: number[]) {
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
