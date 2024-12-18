import { PublicKey } from "@solana/web3.js";
import {
  AccountLayout,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { provider } from "./data";

export async function getTokens(address: string) {
  console.log("getTokens function calling");
  // limit 35
  const tokenAccounts = await  provider.getTokenAccountsByOwner(
    new PublicKey(address),
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );
  const token2022Account = await  provider.getTokenAccountsByOwner(
    new PublicKey(address),
    {
      programId: TOKEN_2022_PROGRAM_ID,
    }
  );
  const tokens = [];
  for (let i = 0; i < tokenAccounts.value.length; i++) {
    const account = tokenAccounts.value[i];
    const token_data = AccountLayout.decode(account.account.data);
    if (Number(token_data.amount) !== 0) {
      tokens.push(token_data);
    }
    tokens.push(token_data);
  }
  for (let i = 0; i < token2022Account.value.length; i++) {
    const account = token2022Account.value[i];
    const token_data = AccountLayout.decode(account.account.data);
    if (Number(token_data.amount) !== 0) {
      tokens.push(token_data);
    }
    tokens.push(token_data);
  }
  console.log(`${address} owns ${tokens.length} tokens`);
  return tokens;
}
