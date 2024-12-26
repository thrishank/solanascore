import { ConfirmedSignatureInfo, PublicKey } from "@solana/web3.js";
import { provider } from "./data";

export async function getSignatures(
  address: string,
): Promise<ConfirmedSignatureInfo[]> {
  const signatures: ConfirmedSignatureInfo[] = [];

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
        },
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
      if (signatures.length > 15000) break;
    } catch (err) {
      console.error("Error fetching signatures:", err);
      break;
    }
  }

  return signatures;
  // const sign = await provider.getSignaturesForAddress(new PublicKey(address));
  // return sign;
}
