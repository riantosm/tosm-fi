import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExportDocument } from "./report-export-types";

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
