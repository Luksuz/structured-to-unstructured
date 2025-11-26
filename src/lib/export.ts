import * as XLSX from "xlsx";
import type { ExtractedRow, SchemaField } from "./types";

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: ExtractedRow[],
  fields: SchemaField[]
): string {
  const headers = fields.map((f) => f.name);
  const rows = data.map((row) =>
    fields.map((field) => {
      const value = row[field.name];
      if (value === null || value === undefined) return "";
      // Escape quotes and wrap in quotes if contains comma or quote
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
  );

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  return csvContent;
}

/**
 * Export data to XLSX format (returns as base64)
 */
export function exportToXLSX(
  data: ExtractedRow[],
  fields: SchemaField[]
): Buffer {
  const headers = fields.map((f) => f.name);
  const rows = data.map((row) =>
    fields.map((field) => {
      const value = row[field.name];
      if (value === null || value === undefined) return "";
      return value;
    })
  );

  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Style the header row
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cell]) continue;
    worksheet[cell].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "6366f1" } },
    };
  }

  // Set column widths
  worksheet["!cols"] = headers.map((header) => ({
    wch: Math.max(header.length + 2, 15),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

/**
 * Download helper for client-side
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string
): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

