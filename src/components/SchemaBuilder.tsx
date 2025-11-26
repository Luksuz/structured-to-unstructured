"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Info } from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import type { SchemaField, ExtractionSchema } from "@/lib/types";

interface SchemaBuilderProps {
  schema: ExtractionSchema;
  onSchemaChange: (schema: ExtractionSchema) => void;
}

const FIELD_TYPES = [
  { value: "text", label: "Text", description: "General text content" },
  { value: "number", label: "Number", description: "Numeric values" },
  { value: "date", label: "Date", description: "Date values (YYYY-MM-DD)" },
  { value: "boolean", label: "Boolean", description: "True/False values" },
  { value: "email", label: "Email", description: "Email addresses" },
  { value: "phone", label: "Phone", description: "Phone numbers" },
  { value: "url", label: "URL", description: "Web addresses" },
] as const;

const PRESET_TEMPLATES = [
  {
    name: "Fencing Services Pricing",
    fields: [
      { name: "service_name", description: "Name of the fencing service (e.g., Site Visit, Material Cost - Wood, Labor Installation)", type: "text" as const, required: true },
      { name: "description", description: "Description of what the service includes", type: "text" as const, required: true },
      { name: "cost_min", description: "Minimum estimated cost (number only, e.g., 50 from '$50-$100')", type: "number" as const, required: true },
      { name: "cost_max", description: "Maximum estimated cost (number only, e.g., 100 from '$50-$100')", type: "number" as const, required: false },
      { name: "unit", description: "Pricing unit (e.g., 'per linear ft', 'each', 'flat rate')", type: "text" as const, required: false },
    ],
  },
  {
    name: "Fencing Workflow Steps",
    fields: [
      { name: "step_number", description: "The step number in the workflow sequence (1, 2, 3, etc.)", type: "number" as const, required: true },
      { name: "step_name", description: "Name of the workflow step (e.g., 'Inquiry & Consultation', 'On-Site Measurement')", type: "text" as const, required: true },
      { name: "step_description", description: "Detailed description of what happens in this step", type: "text" as const, required: true },
    ],
  },
  {
    name: "Contact List",
    fields: [
      { name: "name", description: "Person's full name", type: "text" as const, required: true },
      { name: "email", description: "Email address", type: "email" as const, required: true },
      { name: "phone", description: "Phone number", type: "phone" as const, required: false },
      { name: "company", description: "Company or organization", type: "text" as const, required: false },
    ],
  },
  {
    name: "Invoice Items",
    fields: [
      { name: "item", description: "Item or product name", type: "text" as const, required: true },
      { name: "quantity", description: "Number of items", type: "number" as const, required: true },
      { name: "price", description: "Unit price", type: "number" as const, required: true },
      { name: "total", description: "Total amount", type: "number" as const, required: false },
    ],
  },
  {
    name: "Event Details",
    fields: [
      { name: "event_name", description: "Name of the event", type: "text" as const, required: true },
      { name: "date", description: "Event date", type: "date" as const, required: true },
      { name: "location", description: "Event location", type: "text" as const, required: false },
      { name: "attendees", description: "Number of attendees", type: "number" as const, required: false },
    ],
  },
];

export function SchemaBuilder({ schema, onSchemaChange }: SchemaBuilderProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const addField = () => {
    const newField: SchemaField = {
      id: generateId(),
      name: "",
      description: "",
      type: "text",
      required: false,
    };
    onSchemaChange({
      fields: [...schema.fields, newField],
    });
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    onSchemaChange({
      fields: schema.fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      ),
    });
  };

  const removeField = (id: string) => {
    onSchemaChange({
      fields: schema.fields.filter((field) => field.id !== id),
    });
  };

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setActivePreset(preset.name);
    onSchemaChange({
      fields: preset.fields.map((f) => ({
        ...f,
        id: generateId(),
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Templates */}
      <div>
        <label className="block text-sm font-medium text-muted mb-3">
          Quick Start Templates
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={cn(
                "px-4 py-2 text-sm rounded-lg border transition-all",
                activePreset === preset.name
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-foreground hover:bg-card-hover"
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Fields */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-muted">
            Data Fields ({schema.fields.length})
          </label>
          <button
            onClick={addField}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        <div className="space-y-3">
          {schema.fields.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <Info className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">
                No fields defined yet. Add fields or choose a template above.
              </p>
            </div>
          ) : (
            schema.fields.map((field, index) => (
              <div
                key={field.id}
                className="group bg-white border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-muted" />
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Field Name */}
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, {
                            name: e.target.value.replace(/\s+/g, "_").toLowerCase(),
                          })
                        }
                        placeholder="field_name"
                        className="input-field w-full text-sm"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-muted mb-1">
                        Description (helps AI understand)
                      </label>
                      <input
                        type="text"
                        value={field.description}
                        onChange={(e) =>
                          updateField(field.id, { description: e.target.value })
                        }
                        placeholder="What data should be extracted?"
                        className="input-field w-full text-sm"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, {
                            type: e.target.value as SchemaField["type"],
                          })
                        }
                        className="input-field w-full text-sm"
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Required Toggle & Delete */}
                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, { required: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-xs text-muted">Required</span>
                    </label>

                    <button
                      onClick={() => removeField(field.id)}
                      className="p-1.5 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

