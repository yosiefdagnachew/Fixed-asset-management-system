import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';

interface ExportButtonProps {
  data: any[];
  columns: { header: string; accessorKey: string }[];
  fileName: string;
}

export function ExportButton({ data, columns, fileName }: ExportButtonProps) {
  const exportToPDF = async () => {
    // Create a simple HTML table
    const tableHtml = `
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            ${columns.map(col => `<th style="border: 1px solid black; padding: 8px;">${col.header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              ${columns.map(col => `<td style="border: 1px solid black; padding: 8px;">${item[col.accessorKey]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Create a new window with the table
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              @media print {
                table { width: 100%; }
                th, td { border: 1px solid black; padding: 8px; }
              }
            </style>
          </head>
          <body>
            <h1 style="text-align: center;">${fileName}</h1>
            ${tableHtml}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => {
        const row: any = {};
        columns.forEach(col => {
          row[col.header] = item[col.accessorKey];
        });
        return row;
      })
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: fileName,
            heading: 'Heading1',
            alignment: 'center',
          }),
          new Table({
            rows: [
              new TableRow({
                children: columns.map(col => 
                  new TableCell({
                    children: [new Paragraph(col.header)],
                    width: {
                      size: 100 / columns.length,
                      type: WidthType.PERCENTAGE,
                    },
                  })
                ),
              }),
              ...data.map(item => 
                new TableRow({
                  children: columns.map(col => 
                    new TableCell({
                      children: [new Paragraph(String(item[col.accessorKey]))],
                      width: {
                        size: 100 / columns.length,
                        type: WidthType.PERCENTAGE,
                      },
                    })
                  ),
                })
              ),
            ],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.docx`;
    link.click();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToWord}
        className="flex items-center gap-2"
      >
        <FileType className="h-4 w-4" />
        Word
      </Button>
    </div>
  );
} 