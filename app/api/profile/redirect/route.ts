// app/api/profile/redirect/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // 本来やりたい処理があるならここで実装。今は暫定で 204/200 を返す。
  // return new Response(null, { status: 204 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
