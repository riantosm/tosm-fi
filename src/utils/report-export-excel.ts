import * as XLSX from "xlsx";
import type { ExportDocument } from "./report-export-types";

function sanitizeSheetName(name: string, usedNames: Set<string>): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, " ").trim().slice(0, 31) || "Sheet";
  let candidate = cleaned;
  let suffix = 2;
  while (usedNames.has(candidate)) {
    candidate = `${cleaned.slice(0, 28)} ${suffix}`;
    suffix += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

export function exportDocumentToExcel(fileName: string, doc: ExportDocument): void {
  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  for (const section of doc.sections) {
    const sheetRows: (string | number)[][] = [[section.heading], section.columns, ...section.rows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(section.heading, usedNames));
  }

  XLSX.writeFile(workbook, fileName);
}
