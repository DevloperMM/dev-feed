import { NextResponse } from "next/server";
import { runIngest } from "../../../rag/ingestion/indexer";

export async function POST() {
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