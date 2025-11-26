"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn, formatFileSize, generateId, isValidFileType } from "@/lib/utils";
import type { UploadedFile } from "@/lib/types";

interface FileUploadProps {
  onFileParsed: (content: string, fileName: string) => void;
}

export function FileUpload({ onFileParsed }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const fileId = generateId();
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "processing",
    };

    setFiles((prev) => [...prev, uploadedFile]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse file");
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "done", content: result.content }
            : f
        )
      );

      onFileParsed(result.content, file.name);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : f
        )
      );
    }
  }, [onFileParsed]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach((file) => {
        if (isValidFileType(file.name)) {
          processFile(file);
        }
      });
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      selectedFiles.forEach((file) => {
        if (isValidFileType(file.name)) {
          processFile(file);
        }
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const colors: Record<string, string> = {
      pdf: "text-red-500",
      docx: "text-blue-500",
      csv: "text-green-500",
      txt: "text-amber-500",
    };
    return colors[ext || ""] || "text-gray-500";
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "drop-zone relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer bg-white",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.csv,.txt"
          multiple
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isDragging ? "bg-primary/20" : "bg-secondary"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-primary" : "text-muted"
            )} />
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium">
              Drop your files here or{" "}
              <span className="text-primary">browse</span>
            </p>
            <p className="text-sm text-muted mt-1">
              Supports PDF, DOCX, CSV, and TXT files
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border shadow-sm"
            >
              <File className={cn("w-5 h-5", getFileIcon(file.name))} />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
              </div>

              <div className="flex items-center gap-2">
                {file.status === "processing" && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                {file.status === "done" && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {file.status === "error" && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-xs text-red-400 max-w-[150px] truncate">
                      {file.error}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-1 hover:bg-secondary rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-muted hover:text-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

