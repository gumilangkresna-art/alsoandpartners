import "server-only";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { cases } from "@/server/db/schemas/cases";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const rows = await db.select().from(cases).where(eq(cases.id, id));
    return NextResponse.json(rows[0] ?? null);
  }

  const rows = await db.select().from(cases).orderBy(desc(cases.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const createSchema = z.object({
    caseNumber: z.string(),
    title: z.string(),
    description: z.string().optional(),
    status: z.string().optional(),
    assignedLawyerId: z.string().optional(),
    clientName: z.string(),
    startDate: z.coerce.date().optional(),
    expectedEndDate: z.coerce.date().optional(),
    actualEndDate: z.coerce.date().optional(),
  });

  try {
    const parsed = createSchema.parse(body);
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    const now = new Date();

    const row: any = {
      id,
      caseNumber: parsed.caseNumber,
      title: parsed.title,
      description: parsed.description,
      status: parsed.status ?? "active",
      assignedLawyerId: parsed.assignedLawyerId,
      clientName: parsed.clientName,
      startDate: parsed.startDate ?? undefined,
      expectedEndDate: parsed.expectedEndDate ?? undefined,
      actualEndDate: parsed.actualEndDate ?? undefined,
      createdAt: now,
    };

    await db.insert(cases).values(row);

    return NextResponse.json({ ok: true, id });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const zerr = err as z.ZodError;
      return NextResponse.json({ error: zerr.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const updateSchema = z.object({
    id: z.string(),
    caseNumber: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    assignedLawyerId: z.string().optional(),
    clientName: z.string().optional(),
    startDate: z.coerce.date().optional(),
    expectedEndDate: z.coerce.date().optional(),
    actualEndDate: z.coerce.date().optional(),
  });

  try {
    const parsed = updateSchema.parse(body);
    await db.update(cases).set({
      caseNumber: parsed.caseNumber,
      title: parsed.title,
      description: parsed.description,
      status: parsed.status,
      assignedLawyerId: parsed.assignedLawyerId,
      clientName: parsed.clientName,
      startDate: parsed.startDate ?? undefined,
      expectedEndDate: parsed.expectedEndDate ?? undefined,
      actualEndDate: parsed.actualEndDate ?? undefined,
    }).where(eq(cases.id, parsed.id));

    const updated = await db.select().from(cases).where(eq(cases.id, parsed.id));
    return NextResponse.json(updated[0]);
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

  await db.delete(cases).where(eq(cases.id, id));
  return NextResponse.json({ ok: true });
}
