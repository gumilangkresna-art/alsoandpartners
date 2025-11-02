import "server-only";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { firmSettings } from "@/server/db/schemas/firmSettings";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function GET() {
  const rows = await db.select().from(firmSettings).limit(1);
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(request: Request) {
  const body = await request.json();
  const schema = z.object({
    firmName: z.string().optional(),
    logoUrl: z.string().url().optional(),
    logoType: z.string().optional(),
    logoText: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
  });

  try {
    const parsed = schema.parse(body);
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    const now = new Date();

    // If a settings row exists, update it instead
    const existing = await db.select().from(firmSettings).limit(1);
    if (existing[0]) {
      await db
        .update(firmSettings)
        .set({
          firmName: parsed.firmName ?? existing[0].firmName,
          logoUrl: parsed.logoUrl ?? existing[0].logoUrl,
          logoType: parsed.logoType ?? existing[0].logoType,
          logoText: parsed.logoText ?? existing[0].logoText,
          primaryColor: parsed.primaryColor ?? existing[0].primaryColor,
          secondaryColor: parsed.secondaryColor ?? existing[0].secondaryColor,
          updatedAt: now,
        } as any)
        .where(eq(firmSettings.id, existing[0].id));

      const updated = await db.select().from(firmSettings).where(eq(firmSettings.id, existing[0].id));
      return NextResponse.json(updated[0]);
    }

    const row: any = {
      id,
      firmName: parsed.firmName ?? "ALSO & PARTNERS",
      logoUrl: parsed.logoUrl,
      logoType: parsed.logoType ?? "text",
      logoText: parsed.logoText ?? "A&P",
      primaryColor: parsed.primaryColor ?? "#1e40af",
      secondaryColor: parsed.secondaryColor ?? "#dc2626",
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(firmSettings).values(row);

    const rows = await db.select().from(firmSettings).where(eq(firmSettings.id, id));
    return NextResponse.json(rows[0]);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const zerr = err as z.ZodError;
      return NextResponse.json({ error: zerr.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
