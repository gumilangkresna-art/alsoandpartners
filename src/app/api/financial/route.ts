import "server-only";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { financialTransactions } from "@/server/db/schemas/financialTransactions";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const rows = await db.select().from(financialTransactions).where(eq(financialTransactions.id, id));
    return NextResponse.json(rows[0] ?? null);
  }

  const rows = await db.select().from(financialTransactions).orderBy(desc(financialTransactions.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const schema = z.object({
    type: z.string(),
    amount: z.number(),
    description: z.string().optional(),
    category: z.string().optional(),
    transactionDate: z.coerce.date().optional(),
    createdBy: z.string().optional(),
    isConfidential: z.boolean().optional(),
  });

  try {
    const parsed = schema.parse(body);
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    const now = new Date();

    const row: any = {
      id,
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
      category: parsed.category,
      transactionDate: parsed.transactionDate ?? now,
      createdBy: parsed.createdBy,
      isConfidential: !!parsed.isConfidential,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(financialTransactions).values(row);

    return NextResponse.json({ ok: true, id });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const zerr = err as z.ZodError;
      return NextResponse.json({ error: zerr.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
  return NextResponse.json({ ok: true });
}
