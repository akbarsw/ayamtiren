import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/credits - get current balance & transactions
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const credits = await prisma.creditBalance.findUnique({
    where: { userId: session.user.id },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ credits, transactions });
}

// POST /api/credits - top up (manual/admin, no payment gateway for now)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const amount = parseFloat(body.amount);

  if (!amount || amount <= 0 || amount > 1000) {
    return NextResponse.json({ error: "Invalid amount (0 - $1000)" }, { status: 400 });
  }

  const updated = await prisma.$transaction([
    prisma.creditBalance.upsert({
      where: { userId: session.user.id },
      update: {
        balance: { increment: amount },
        totalTopUp: { increment: amount },
      },
      create: {
        userId: session.user.id,
        balance: amount,
        totalTopUp: amount,
      },
    }),
    prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "TOPUP",
        amount,
        description: `Manual top-up $${amount.toFixed(2)}`,
        status: "COMPLETED",
      },
    }),
  ]);

  return NextResponse.json({ success: true, balance: updated[0].balance });
}
