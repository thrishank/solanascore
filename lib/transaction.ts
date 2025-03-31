import { PublicKey } from "@solana/web3.js";
import { provider } from "./data";

export async function getTransaction(
  signature: string,
  pubkey: string,
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
        }),
      );

      // Resolve account keys using address tables
      const resolvedAccounts = message.getAccountKeys({
        // @ts-expect-error
        addressLookupTableAccounts: addressTables.map((res) => res.value),
      });

      const programIds: string[] = [];
      const compiledInstructions = message.compiledInstructions;
      compiledInstructions.forEach((instruction) => {
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

export async function getTransactionDune(address: string) {
  const data = [];
  let loop = true;
  let offset = undefined;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  while (loop) {
    const dune_data = await dune(address, offset);
    if (dune_data.transactions) {
      for (const transaction of dune_data.transactions) {
        const transactionDate = new Date(transaction.block_time / 1000);
        if (transactionDate >= oneYearAgo) {
          data.push(transaction);
        } else {
          loop = false;
          break;
        }
      }

      if (!loop) break;
    }

    offset = dune_data.next_offset;
    if (!offset) break;
  }

  const arr = data.map((transaction: any) => {
    return {
      time: transaction.block_time,
      fee: transaction.raw_transaction.meta.fee,
      programIds: transaction.raw_transaction.transaction.message.accountKeys,
    };
  });

  return arr;
}

async function dune(address: string, offset?: string) {
  const options = {
    method: "GET",
    headers: { "X-Dune-Api-Key": "i3Ko8OSHBL1GVVNMT6zv1RBOGUEwf0a0" },
  };
  const url = offset
    ? `https://api.dune.com/api/echo/beta/transactions/svm/${address}?limit=2000&offset=${offset}`
    : `https://api.dune.com/api/echo/beta/transactions/svm/${address}?limit=2000`;
  const res = await fetch(url, options);
  const data = await res.json();
  return data;
}
