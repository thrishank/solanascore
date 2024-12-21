import { PublicKey } from "@solana/web3.js";
import { getAllDomains, resolve, reverseLookup } from "@bonfida/spl-name-service";
import { provider } from "./data";

export async function getDomains(wallet: string): Promise<boolean> {
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

export async function getWallet(domain: string): Promise<string | null> {
  const wallet = await resolve(provider, domain);
  return wallet.toString()
}