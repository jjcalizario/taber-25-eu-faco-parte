import { NextResponse } from "next/server";
import { montarFeed } from "@/lib/servidor/feed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feed = await montarFeed();
    return NextResponse.json(feed, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("feed /tv", e);
    return NextResponse.json({ erro: "Não foi possível carregar os relatos." }, { status: 503 });
  }
}
