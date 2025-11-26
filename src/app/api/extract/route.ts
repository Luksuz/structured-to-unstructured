import { NextRequest, NextResponse } from "next/server";
import { extractData } from "@/lib/extractor";
import type { ExtractionSchema } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, schema } = body as {
      content: string;
      schema: ExtractionSchema;
    };

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    if (!schema || !schema.fields || schema.fields.length === 0) {
      return NextResponse.json(
        { error: "Schema with at least one field is required" },
        { status: 400 }
      );
    }

    const result = await extractData(content, schema);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract data" },
      { status: 500 }
    );
  }
}

