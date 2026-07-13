import type { ExportDocument } from "./report-export-types";

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

const UTF8_BOM = "\uFEFF";

export function exportDocumentToCsv(fileName: string, doc: ExportDocument): void {
  const lines: string[] = [toCsvRow([doc.title])];
  if (doc.subtitle) lines.push(toCsvRow([doc.subtitle]));

  for (const section of doc.sections) {
    lines.push("");
    lines.push(toCsvRow([section.heading]));
    lines.push(toCsvRow(section.columns));
    for (const row of section.rows) lines.push(toCsvRow(row));
  }

  const blob = new Blob([UTF8_BOM + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, fileName);
}
