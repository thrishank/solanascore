import { TldParser } from "@onsol/tldparser";
import { Connection } from "@solana/web3.js";

const RPC_URL = "https://api.devnet.solana.com";

const connection = new Connection(RPC_URL);

export async function resolveDomain(domain: string): Promise<string | null> {
  try {
    const parser = new TldParser(connection);
    const owner = await parser.getOwnerFromDomainTld(domain);
    return owner?.toString() || null;
  } catch (error) {
    console.error(`Failed to resolve domain: ${domain}`, error);
    return null;
  }
}
