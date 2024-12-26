import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function GET() {
  const data = await prisma.walletData.findMany();

  const accounts = data.map((d) => {
    return {
      address: d.address,
      score: d.score,
    };
  });

  return NextResponse.json({ unique_wallets: data.length, accounts });
}
