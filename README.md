# DataForge AI - Unstructured to Structured Data Transformer

Transform unstructured documents (PDF, DOCX, CSV, TXT) into structured data using AI. Define your own schema and let AI extract exactly the data you need, then export to Excel or CSV.

## Features

- **Multi-format Support**: Upload PDF, DOCX, CSV, or TXT files
- **Custom Schema Definition**: Define exactly what data you want to extract
- **AI-Powered Extraction**: Uses Google Gemini 2.5 Flash via OpenRouter for intelligent data extraction
- **Interactive Data Editing**: Edit extracted data directly in the table
- **Export Options**: Download as Excel (.xlsx) or CSV

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create a `.env.local` file in the root directory:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
   
   Get your API key from [OpenRouter](https://openrouter.ai/keys)

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Document**: Drag and drop or click to upload your document (PDF, DOCX, CSV, or TXT)

2. **Define Schema**: Either use a preset template or define custom fields:
   - **Field Name**: The column name for your data (e.g., `name`, `email`, `price`)
   - **Description**: Tell the AI what to extract (e.g., "Person's full name from the document")
   - **Type**: Select the data type (text, number, date, boolean, email, phone, URL)
   - **Required**: Mark fields that must be extracted

3. **Extract Data**: Click "Extract Data with AI" to process your document

4. **Review & Edit**: Review the extracted data, click any cell to edit

5. **Export**: Download as Excel or CSV

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: LangChain with OpenRouter (Google Gemini 2.5 Flash)
- **Styling**: Tailwind CSS
- **File Parsing**: pdf-parse, mammoth (DOCX), papaparse (CSV)
- **Export**: xlsx library

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── parse/      # Document parsing endpoint
│   │   ├── extract/    # AI extraction endpoint
│   │   └── export/     # Export to CSV/Excel
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── FileUpload.tsx
│   ├── SchemaBuilder.tsx
│   └── DataPreview.tsx
└── lib/
    ├── openrouter.ts   # OpenRouter/LangChain integration
    ├── file-parsers.ts # Document parsing utilities
    ├── extractor.ts    # AI extraction logic
    ├── export.ts       # Export utilities
    ├── types.ts        # TypeScript types
    └── utils.ts        # Helper functions
```

## License

MIT

