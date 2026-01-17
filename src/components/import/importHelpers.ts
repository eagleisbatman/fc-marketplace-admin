import * as XLSX from "xlsx";
import type { TemplateConfig } from "@/config/importTemplates";

// Upload Limits
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_ROW_COUNT = 10000;

// Upload Result Type
export interface UploadResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

// Download CSV template
export function downloadCSV(template: TemplateConfig): void {
  const headers = template.columns.join(",");
  const rows = template.sampleData.map((row) =>
    template.columns
      .map((col) => {
        const value = row[col] || "";
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",")
  );
  const csvContent = [headers, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${template.id}_template.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Download Excel template
export function downloadExcel(template: TemplateConfig): void {
  const worksheetData = [
    template.columns,
    ...template.sampleData.map((row) =>
      template.columns.map((col) => row[col] || "")
    ),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, template.title);

  // Auto-size columns
  const colWidths = template.columns.map((col) => {
    const maxLength = Math.max(
      col.length,
      ...template.sampleData.map((row) => (row[col] || "").length)
    );
    return { wch: Math.min(maxLength + 2, 40) };
  });
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${template.id}_template.xlsx`);
}

// Parse CSV file
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i]?.replace(/^"|"$/g, "") || "";
    });
    return row;
  });
}

// Parse Excel file
export function parseExcel(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    raw: false,
    defval: "",
  });

  return jsonData.map((row) => {
    const stringRow: Record<string, string> = {};
    Object.entries(row).forEach(([key, value]) => {
      stringRow[key] = String(value ?? "");
    });
    return stringRow;
  });
}

// Download template with just headers (no sample data)
export function downloadTemplateCSV(
  columns: string[],
  filename: string
): void {
  const csvContent = columns.join(",") + "\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Download Excel template with just headers
export function downloadTemplateExcel(
  columns: string[],
  filename: string,
  sheetName: string = "Template"
): void {
  const worksheet = XLSX.utils.aoa_to_sheet([columns]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const colWidths = columns.map((col) => ({
    wch: Math.min(col.length + 2, 40),
  }));
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Generic interface for templates with sample data
interface GenericTemplateConfig {
  id: string;
  title: string;
  columns: string[];
  sampleData: Record<string, string>[];
}

// Download CSV with sample data (generic)
export function downloadCSVGeneric(template: GenericTemplateConfig): void {
  const headers = template.columns.join(",");
  const rows = template.sampleData.map((row) =>
    template.columns
      .map((col) => {
        const value = row[col] || "";
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",")
  );
  const csvContent = [headers, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${template.id}_template.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Download Excel with sample data (generic)
export function downloadExcelGeneric(template: GenericTemplateConfig): void {
  const worksheetData = [
    template.columns,
    ...template.sampleData.map((row) =>
      template.columns.map((col) => row[col] || "")
    ),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, template.title);

  // Auto-size columns
  const colWidths = template.columns.map((col) => {
    const maxLength = Math.max(
      col.length,
      ...template.sampleData.map((row) => (row[col] || "").length)
    );
    return { wch: Math.min(maxLength + 2, 40) };
  });
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${template.id}_template.xlsx`);
}
