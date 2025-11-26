import { NextRequest, NextResponse } from "next/server";
import { exportToCSV, exportToXLSX } from "@/lib/export";
import type { ExtractedRow, SchemaField } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, fields, format } = body as {
      data: ExtractedRow[];
      fields: SchemaField[];
      format: "csv" | "xlsx";
    };

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "No data provided" },
        { status: 400 }
      );
    }

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: "No fields provided" },
        { status: 400 }
      );
    }

    if (format === "csv") {
      const csv = exportToCSV(data, fields);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="extracted_data.csv"',
        },
      });
    } else if (format === "xlsx") {
      const buffer = exportToXLSX(data, fields);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="extracted_data.xlsx"',
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid format. Supported formats: csv, xlsx" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export data" },
      { status: 500 }
    );
  }
}

