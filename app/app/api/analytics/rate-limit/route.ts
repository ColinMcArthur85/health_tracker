import { NextResponse } from "next/server";
import { getUsdaStats } from "@/lib/rateLimitMonitor";

export async function GET() {
  return NextResponse.json({ usda: getUsdaStats() });
}
