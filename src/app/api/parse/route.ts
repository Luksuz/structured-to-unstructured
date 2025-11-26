import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/file-parsers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const validExtensions = [".pdf", ".docx", ".csv", ".txt"];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Supported types: PDF, DOCX, CSV, TXT" },
        { status: 400 }
      );
    }

    const parsed = await parseFile(file);

    return NextResponse.json({
      success: true,
      content: parsed.text,
      type: parsed.type,
      metadata: parsed.metadata,
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse file" },
      { status: 500 }
    );
  }
}

