"use client";

import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { SchemaBuilder } from "@/components/SchemaBuilder";
import { DataPreview } from "@/components/DataPreview";
import { 
  Sparkles, 
  FileInput, 
  TableProperties, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  Database,
  FileOutput
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractionSchema, ExtractedRow, ExtractionStatus } from "@/lib/types";

export default function Home() {
  const [documentContent, setDocumentContent] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("");
  const [schema, setSchema] = useState<ExtractionSchema>({ fields: [] });
  const [extractedData, setExtractedData] = useState<ExtractedRow[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [status, setStatus] = useState<ExtractionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleFileParsed = (content: string, fileName: string) => {
    setDocumentContent(content);
    setDocumentName(fileName);
    setError(null);
    if (activeStep === 1) {
      setActiveStep(2);
    }
  };

  const handleExtract = async () => {
    if (!documentContent) {
      setError("Please upload a document first");
      return;
    }

    if (schema.fields.length === 0) {
      setError("Please define at least one field to extract");
      return;
    }

    const invalidFields = schema.fields.filter(
      (f) => !f.name.trim() || !f.description.trim()
    );
    if (invalidFields.length > 0) {
      setError("All fields must have a name and description");
      return;
    }

    setStatus("extracting");
    setError(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: documentContent,
          schema,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Extraction failed");
      }

      setExtractedData(result.rows);
      setConfidence(result.confidence);
      setWarnings(result.warnings || []);
      setStatus("done");
      setActiveStep(3);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Extraction failed");
    }
  };

  const steps = [
    {
      number: 1,
      title: "Upload Document",
      icon: FileInput,
      description: "PDF, DOCX, CSV, or TXT",
    },
    {
      number: 2,
      title: "Define Schema",
      icon: TableProperties,
      description: "Set fields to extract",
    },
    {
      number: 3,
      title: "Export Data",
      icon: FileOutput,
      description: "Download as Excel/CSV",
    },
  ];

  return (
    <main className="min-h-screen bg-background bg-grid-pattern">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
        
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Powered by AI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">DataForge</span>
              <span className="text-foreground"> AI</span>
            </h1>
            
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Transform unstructured documents into structured data.
              Upload any document and extract exactly the data you need.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in stagger-2">
            {[
              { icon: Zap, text: "Lightning Fast" },
              { icon: Database, text: "Smart Extraction" },
              { icon: FileOutput, text: "Excel Export" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-sm shadow-sm"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps Progress */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => {
                  if (step.number <= activeStep || (step.number === 2 && documentContent)) {
                    setActiveStep(step.number);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  activeStep === step.number
                    ? "bg-white border border-primary/30 shadow-md"
                    : step.number < activeStep
                    ? "opacity-70 hover:opacity-100"
                    : "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    activeStep === step.number
                      ? "bg-primary text-white shadow-md"
                      : step.number < activeStep
                      ? "bg-green-100 text-green-600"
                      : "bg-secondary text-muted"
                  )}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted">{step.description}</p>
                </div>
              </button>
              
              {index < steps.length - 1 && (
                <ArrowRight className={cn(
                  "w-5 h-5 mx-4",
                  step.number < activeStep ? "text-green-400" : "text-border"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="animated-border p-6 md:p-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">Error</p>
                <p className="text-sm text-red-300/80">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Upload */}
          <div className={cn(activeStep === 1 ? "block" : "hidden")}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Upload Your Document</h2>
              <p className="text-muted mt-1">
                Drag and drop your file or click to browse. We support PDF, DOCX, CSV, and TXT files.
              </p>
            </div>
            <FileUpload onFileParsed={handleFileParsed} />
            
            {documentContent && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-400">
                  ✓ Document &quot;{documentName}&quot; parsed successfully!
                </p>
                <button
                  onClick={() => setActiveStep(2)}
                  className="mt-3 btn-primary px-6 py-2 rounded-lg text-white"
                >
                  Continue to Schema Definition →
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Schema Definition */}
          <div className={cn(activeStep === 2 ? "block" : "hidden")}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Define Your Schema</h2>
              <p className="text-muted mt-1">
                Tell the AI what data to extract. Add fields and describe what each one should contain.
              </p>
            </div>
            
            <SchemaBuilder schema={schema} onSchemaChange={setSchema} />

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="text-muted hover:text-foreground transition-colors"
              >
                ← Back to Upload
              </button>
              
              <button
                onClick={handleExtract}
                disabled={status === "extracting" || schema.fields.length === 0}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                  status === "extracting"
                    ? "bg-primary/50 text-white/70 cursor-not-allowed"
                    : schema.fields.length === 0
                    ? "bg-secondary text-muted cursor-not-allowed"
                    : "btn-primary text-white glow-primary"
                )}
              >
                {status === "extracting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Extracting Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Extract Data with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 3: Data Preview */}
          <div className={cn(activeStep === 3 ? "block" : "hidden")}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Extracted Data</h2>
              <p className="text-muted mt-1">
                Review your extracted data, make edits if needed, and export to Excel or CSV.
              </p>
            </div>

            <DataPreview
              data={extractedData}
              fields={schema.fields}
              confidence={confidence}
              warnings={warnings}
              onDataChange={setExtractedData}
            />

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="text-muted hover:text-foreground transition-colors"
              >
                ← Modify Schema
              </button>
              
              <button
                onClick={() => {
                  setDocumentContent("");
                  setDocumentName("");
                  setExtractedData([]);
                  setSchema({ fields: [] });
                  setStatus("idle");
                  setActiveStep(1);
                }}
                className="text-primary hover:text-primary-hover transition-colors"
              >
                Start New Extraction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted">
          <p>
            Powered by{" "}
            <span className="text-primary font-medium">Google Gemini 2.5 Flash</span> via OpenRouter
          </p>
        </div>
      </footer>
    </main>
  );
}

