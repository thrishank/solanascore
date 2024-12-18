import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { provider } from "./data";

export async function getTransaction(
  signature: string,
  pubkey: string
): Promise<{ fee: number; time: number; programIds: string[] }> {
  
   const address = new PublicKey(pubkey);

  try {
    const transactionDetails = await provider.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "finalized",
    });

    if (transactionDetails) {
      const signatures = transactionDetails.transaction.signatures;
      const signers = transactionDetails.transaction.message.staticAccountKeys
        .slice(0, signatures.length)
        .map((key) => key.toBase58());

      const isAddressSigner = signers.includes(address.toBase58());

      if (!isAddressSigner) {
        return {
          fee: 0,
          time: 0,
          programIds: [],
        };
      }

      const message = transactionDetails.transaction.message;

      // Fetch address table lookups
      const addressTableLookups = message.addressTableLookups || [];

      const addressTables = await Promise.all(
        addressTableLookups.map(async (lookup) => {
          return provider.getAddressLookupTable(lookup.accountKey);
        })
      );

      // Resolve account keys using address tables
      const resolvedAccounts = message.getAccountKeys({
        // @ts-ignore
        addressLookupTableAccounts: addressTables.map((res) => res.value),
      });

      const programIds: string[] = [];
      const compiledInstructions = message.compiledInstructions;
      compiledInstructions.forEach((instruction, index) => {
        const programId =
          resolvedAccounts.staticAccountKeys[
            instruction.programIdIndex
          ].toBase58();
        programIds.push(programId);
      });

      return {
        fee: transactionDetails.meta!.fee,
        time: transactionDetails.blockTime!,
        programIds,
      };
    } else {
      const errr = `No details found for transaction: ${signature}`;
      console.error(errr);
      return { fee: 0, time: 0, programIds: [] };
    }
  } catch (err) {
    console.error(`Error fetching transaction: ${signature}`, err);
    return { fee: 0, time: 0, programIds: [] };
  }
}
