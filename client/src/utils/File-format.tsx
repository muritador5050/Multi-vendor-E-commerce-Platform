import React from 'react';
import { Button, SimpleGrid } from '@chakra-ui/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportButtonsProps {
  exportRef: React.RefObject<HTMLDivElement | null>;
  exportData: Record<string, unknown>[];
  fileName?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  exportRef,
  exportData,
  fileName = 'exported-data',
}) => {
  // Print functionality
  const handlePrint = () => {
    if (!exportRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${fileName}</title></head>
          <body>${exportRef.current.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${fileName}.csv`);
    link.click();
  };

  const exportToPDF = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      // Handle multiple pages if content is too long
      if (height > pdf.internal.pageSize.getHeight()) {
        let yPosition = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();

        while (yPosition < height) {
          pdf.addImage(imgData, 'PNG', 0, -yPosition, width, height);
          yPosition += pageHeight;
          if (yPosition < height) {
            pdf.addPage();
          }
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      }

      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
      <Button
        onClick={handlePrint}
        bg='#203a43'
        colorScheme='teal'
        variant='solid'
      >
        PRINT
      </Button>
      <Button
        onClick={exportToPDF}
        bg='#203a43'
        colorScheme='teal'
        variant='solid'
      >
        PDF
      </Button>
      <Button
        onClick={exportToExcel}
        bg='#203a43'
        colorScheme='teal'
        variant='solid'
      >
        EXCEL
      </Button>
      <Button
        onClick={exportToCSV}
        bg='#203a43'
        colorScheme='teal'
        variant='solid'
      >
        CSV
      </Button>
    </SimpleGrid>
  );
};

export default ExportButtons;
