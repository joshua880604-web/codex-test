import { NextRequest, NextResponse } from "next/server";
import { currencyCodes, referenceRate } from "@/lib/rates";
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from") ?? "USD",
    to = request.nextUrl.searchParams.get("to") ?? "EUR";
  if (!currencyCodes.has(from) || !currencyCodes.has(to))
    return NextResponse.json(
      { error: "Unsupported currency." },
      { status: 400 },
    );
  try {
    return NextResponse.json(await referenceRate(from, to));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Reference rate unavailable." },
      { status: 503 },
    );
  }
}
