import { PublicKey } from "@solana/web3.js";
import { getAllDomains, reverseLookup } from "@bonfida/spl-name-service";
import { provider } from "./data";

export async function getDomains(wallet: string): Promise<boolean> {
  console.log("domain functin calling")
  const ownerWallet = new PublicKey(wallet);
  const allDomainKeys = await getAllDomains(provider, ownerWallet);
  const hasDomain = await Promise.any(
    allDomainKeys.map(async (key) => {
      await reverseLookup(provider, key);
      return true;
    })
  ).catch(() => false);
  console.log(`${wallet} owns at least one SNS domain: ${hasDomain}`);
  return hasDomain;
}