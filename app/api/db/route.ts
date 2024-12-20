import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const primsa = new PrismaClient();
export async function GET() {
  // const data = await primsa.walletData.findMany();
  // const send = data.map((id) => {
  //   return {
  //     address: id.address,
  //     hasDomain: id.hasDomain,
  //     programId: id.programId,
  //     score: id.score,
  //     stats: id.stats,
  //     totalTransactions: id.totalTransactions
  //   };
  // });
  return NextResponse.json("send");
}
