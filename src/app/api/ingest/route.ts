import { NextResponse } from "next/server";
import { runIngest } from "../../../rag/ingestion/indexer";

export async function POST(request: Request) {
  // Guard with CRON_SECRET if set
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runIngest();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Ingest failed" },
      { status: 500 }
    );
  }
}