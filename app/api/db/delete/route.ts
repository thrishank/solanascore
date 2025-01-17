import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const address = url.searchParams.get("address")!;
    await prisma.walletData.delete({
      where: {
        address: address,
      },
    });

    return NextResponse.json(address);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
