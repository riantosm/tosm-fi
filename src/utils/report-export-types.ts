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
