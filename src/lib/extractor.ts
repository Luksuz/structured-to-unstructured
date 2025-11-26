import { getOpenRouterModel } from "./openrouter";
import type { ExtractionSchema, ExtractionResult, ExtractedRow } from "./types";

/**
 * Build the extraction prompt based on schema and content
 */
function buildExtractionPrompt(
  schema: ExtractionSchema,
  content: string
): string {
  const fieldDescriptions = schema.fields
    .map((field) => {
      const typeHint = getTypeHint(field.type);
      return `- "${field.name}" (${field.type}${field.required ? ", required" : ", optional"}): ${field.description}${typeHint}`;
    })
    .join("\n");

  return `You are a data extraction expert. Your task is to extract structured data from the provided document content based on the specified schema.

## Schema Fields to Extract:
${fieldDescriptions}

## Important Instructions:
1. Extract ALL matching records/rows from the document
2. Return data as a valid JSON array of objects
3. Use null for missing optional fields
4. For required fields that are missing, make your best guess or use empty string
5. Maintain consistent data types as specified in the schema
6. If no data can be extracted, return an empty array []
7. Do NOT include any markdown formatting, code blocks, or explanations - ONLY return the raw JSON array

## Document Content:
${content}

## Response (JSON array only):`;
}

/**
 * Get type hints for better extraction
 */
function getTypeHint(type: string): string {
  switch (type) {
    case "date":
      return " (format: YYYY-MM-DD)";
    case "boolean":
      return " (true/false)";
    case "number":
      return " (numeric value only)";
    case "email":
      return " (valid email format)";
    case "phone":
      return " (phone number format)";
    case "url":
      return " (valid URL format)";
    default:
      return "";
  }
}

/**
 * Parse and validate the AI response
 */
function parseExtractionResponse(
  response: string,
  schema: ExtractionSchema
): ExtractionResult {
  // Clean up the response - remove markdown code blocks if present
  let cleanedResponse = response.trim();
  
  // Remove markdown code block formatting
  if (cleanedResponse.startsWith("```json")) {
    cleanedResponse = cleanedResponse.slice(7);
  } else if (cleanedResponse.startsWith("```")) {
    cleanedResponse = cleanedResponse.slice(3);
  }
  if (cleanedResponse.endsWith("```")) {
    cleanedResponse = cleanedResponse.slice(0, -3);
  }
  cleanedResponse = cleanedResponse.trim();

  let parsedData: unknown[];
  try {
    parsedData = JSON.parse(cleanedResponse);
  } catch {
    // Try to extract JSON array from the response
    const match = cleanedResponse.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        parsedData = JSON.parse(match[0]);
      } catch {
        throw new Error("Failed to parse AI response as JSON");
      }
    } else {
      throw new Error("No valid JSON array found in response");
    }
  }

  if (!Array.isArray(parsedData)) {
    throw new Error("Response is not an array");
  }

  const warnings: string[] = [];
  const rows: ExtractedRow[] = parsedData.map((item, index) => {
    const row: ExtractedRow = {};
    
    for (const field of schema.fields) {
      const value = (item as Record<string, unknown>)[field.name];
      
      if (value === undefined || value === null) {
        if (field.required) {
          warnings.push(`Row ${index + 1}: Missing required field "${field.name}"`);
        }
        row[field.name] = null;
        continue;
      }

      // Type coercion
      switch (field.type) {
        case "number":
          const num = Number(value);
          row[field.name] = isNaN(num) ? null : num;
          break;
        case "boolean":
          row[field.name] = Boolean(value);
          break;
        default:
          row[field.name] = String(value);
      }
    }

    return row;
  });

  // Calculate confidence based on completeness
  const totalFields = rows.length * schema.fields.filter((f) => f.required).length;
  const filledFields = rows.reduce((acc, row) => {
    return acc + schema.fields.filter((f) => f.required && row[f.name] !== null).length;
  }, 0);
  const confidence = totalFields > 0 ? (filledFields / totalFields) * 100 : 100;

  return {
    rows,
    confidence: Math.round(confidence),
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Extract structured data from document content using AI
 */
export async function extractData(
  content: string,
  schema: ExtractionSchema
): Promise<ExtractionResult> {
  if (!schema.fields || schema.fields.length === 0) {
    throw new Error("Schema must have at least one field");
  }

  const model = getOpenRouterModel({
    temperature: 0.1,
    maxTokens: 4096,
  });

  const prompt = buildExtractionPrompt(schema, content);
  
  const response = await model.invoke(prompt);
  const responseText = typeof response.content === "string" 
    ? response.content 
    : JSON.stringify(response.content);

  return parseExtractionResponse(responseText, schema);
}

