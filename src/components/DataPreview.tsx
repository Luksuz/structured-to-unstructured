"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, AlertTriangle, CheckCircle, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractedRow, SchemaField } from "@/lib/types";

interface DataPreviewProps {
  data: ExtractedRow[];
  fields: SchemaField[];
  confidence: number;
  warnings?: string[];
  onDataChange: (data: ExtractedRow[]) => void;
}

export function DataPreview({
  data,
  fields,
  confidence,
  warnings,
  onDataChange,
}: DataPreviewProps) {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    fieldName: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const startEditing = (rowIndex: number, fieldName: string, value: unknown) => {
    setEditingCell({ rowIndex, fieldName });
    setEditValue(value === null ? "" : String(value));
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const field = fields.find((f) => f.name === editingCell.fieldName);
    let newValue: string | number | boolean | null = editValue;

    if (field) {
      switch (field.type) {
        case "number":
          newValue = editValue === "" ? null : Number(editValue);
          break;
        case "boolean":
          newValue = editValue.toLowerCase() === "true";
          break;
        default:
          newValue = editValue || null;
      }
    }

    const newData = data.map((row, index) =>
      index === editingCell.rowIndex
        ? { ...row, [editingCell.fieldName]: newValue }
        : row
    );

    onDataChange(newData);
    setEditingCell(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, fields, format }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `extracted_data.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-amber-600";
    return "text-red-600";
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-white">
        <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-muted">No data extracted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-border rounded-lg shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Rows</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Columns</p>
            <p className="text-2xl font-bold">{fields.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Confidence</p>
            <p className={cn("text-2xl font-bold", getConfidenceColor())}>
              {confidence}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-card-hover border border-border rounded-lg transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 btn-primary text-white rounded-lg disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Extraction Warnings</p>
              <ul className="mt-1 text-sm text-amber-600 list-disc list-inside">
                {warnings.slice(0, 5).map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
                {warnings.length > 5 && (
                  <li>...and {warnings.length - 5} more</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto border border-border rounded-lg bg-white shadow-sm">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="text-left text-xs w-12">#</th>
              {fields.map((field) => (
                <th key={field.id} className="text-left text-xs">
                  <div className="flex items-center gap-1">
                    {field.name}
                    {field.required && (
                      <span className="text-primary">*</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="text-muted text-xs">{rowIndex + 1}</td>
                {fields.map((field) => {
                  const value = row[field.name];
                  const isEditing =
                    editingCell?.rowIndex === rowIndex &&
                    editingCell?.fieldName === field.name;
                  const isEmpty = value === null || value === undefined || value === "";

                  return (
                    <td
                      key={field.id}
                      className={cn(
                        "group relative",
                        isEmpty && field.required && "bg-red-500/5"
                      )}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type={field.type === "number" ? "number" : "text"}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="input-field w-full text-sm py-1 px-2"
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="p-1 text-green-400 hover:bg-green-400/10 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => startEditing(rowIndex, field.name, value)}
                        >
                          <span
                            className={cn(
                              "truncate max-w-[200px]",
                              isEmpty && "text-muted italic"
                            )}
                          >
                            {isEmpty ? "—" : String(value)}
                          </span>
                          <Edit2 className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Success Note */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span>Click any cell to edit. Changes are saved automatically.</span>
      </div>
    </div>
  );
}

