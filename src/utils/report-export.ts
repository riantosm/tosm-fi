import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportSection {
  heading: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface ExportDocument {
  title: string;
  subtitle?: string;
  sections: ExportSection[];
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsvRow(fields: (string | number)[]): string {
  return fields.map(escapeCsvField).join(",");
}

export function exportDocumentToCsv(fileName: string, doc: ExportDocument): void {
  const lines: string[] = [toCsvRow([doc.title])];
  if (doc.subtitle) lines.push(toCsvRow([doc.subtitle]));

  for (const section of doc.sections) {
    lines.push("");
    lines.push(toCsvRow([section.heading]));
    lines.push(toCsvRow(section.columns));
    for (const row of section.rows) lines.push(toCsvRow(row));
  }

  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, fileName);
}

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

const PDF_PRIMARY_COLOR: [number, number, number] = [18, 132, 107];
const PDF_MARGIN = 14;

export function exportDocumentToPdf(fileName: string, doc: ExportDocument): void {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let cursorY = 18;

  pdf.setFontSize(16);
  pdf.text(doc.title, PDF_MARGIN, cursorY);
  cursorY += 6;

  if (doc.subtitle) {
    pdf.setFontSize(10);
    pdf.setTextColor(120);
    pdf.text(doc.subtitle, PDF_MARGIN, cursorY);
    pdf.setTextColor(0);
    cursorY += 6;
  }

  for (const section of doc.sections) {
    if (cursorY > pageHeight - 40) {
      pdf.addPage();
      cursorY = 18;
    }

    pdf.setFontSize(12);
    pdf.text(section.heading, PDF_MARGIN, cursorY + 6);

    autoTable(pdf, {
      startY: cursorY + 10,
      head: [section.columns],
      body: section.rows.map((row) => row.map(String)),
      styles: { fontSize: 9 },
      headStyles: { fillColor: PDF_PRIMARY_COLOR },
      margin: { left: PDF_MARGIN, right: PDF_MARGIN },
    });

    const finalY = (pdf as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    cursorY = (finalY ?? cursorY + 10) + 12;
  }

  pdf.save(fileName);
}
