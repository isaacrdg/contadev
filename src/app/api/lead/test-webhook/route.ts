import { NextResponse } from "next/server";
import { sendTestWebhook } from "@/lib/lead-webhook";

export async function POST() {
  const result = await sendTestWebhook();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
