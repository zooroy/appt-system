import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

function validateLineSignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET ?? "";
  const expected = createHmac("sha256", secret)
    .update(body)
    .digest("base64");
  return expected === signature;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature");
  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  const body = await req.text();

  if (!validateLineSignature(body, signature)) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
