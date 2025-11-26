import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import Papa from "papaparse";

export interface ParsedContent {
  text: string;
  type: "pdf" | "docx" | "csv" | "txt";
  metadata?: {
    pages?: number;
    rows?: number;
    columns?: string[];
  };
}

/**
 * Parse PDF file to text
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedContent> {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    type: "pdf",
    metadata: {
      pages: data.numpages,
    },
  };
}

/**
 * Parse DOCX file to text
 */
export async function parseDOCX(buffer: Buffer): Promise<ParsedContent> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    type: "docx",
  };
}

/**
 * Parse CSV file to text and structure
 */
export async function parseCSV(text: string): Promise<ParsedContent> {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  const columns = result.meta.fields || [];
  const rows = result.data as Record<string, string>[];

  // Convert back to readable format for AI processing
  let formattedText = `CSV Data with ${rows.length} rows and ${columns.length} columns\n\n`;
  formattedText += `Columns: ${columns.join(", ")}\n\n`;
  formattedText += "Data:\n";
  
  rows.forEach((row, index) => {
    formattedText += `Row ${index + 1}: ${JSON.stringify(row)}\n`;
  });

  return {
    text: formattedText,
    type: "csv",
    metadata: {
      rows: rows.length,
      columns,
    },
  };
}

/**
 * Parse plain text file
 */
export function parseTXT(text: string): ParsedContent {
  return {
    text,
    type: "txt",
  };
}

/**
 * Main parser function that routes to appropriate parser based on file type
 */
export async function parseFile(
  file: File
): Promise<ParsedContent> {
  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (fileName.endsWith(".pdf")) {
    return parsePDF(buffer);
  } else if (fileName.endsWith(".docx")) {
    return parseDOCX(buffer);
  } else if (fileName.endsWith(".csv")) {
    const text = buffer.toString("utf-8");
    return parseCSV(text);
  } else if (fileName.endsWith(".txt")) {
    const text = buffer.toString("utf-8");
    return parseTXT(text);
  } else {
    throw new Error(`Unsupported file type: ${fileName}`);
  }
}

