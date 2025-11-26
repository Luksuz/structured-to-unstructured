export interface SchemaField {
  id: string;
  name: string;
  description: string;
  type: "text" | "number" | "date" | "boolean" | "email" | "phone" | "url";
  required: boolean;
}

export interface ExtractionSchema {
  fields: SchemaField[];
}

export interface ExtractedRow {
  [key: string]: string | number | boolean | null;
}

export interface ExtractionResult {
  rows: ExtractedRow[];
  confidence: number;
  warnings?: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

export type ExtractionStatus = "idle" | "uploading" | "parsing" | "extracting" | "done" | "error";

