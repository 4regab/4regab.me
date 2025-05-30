import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { ExportOptions, HelperTask } from '@/types/helper';

export class ExportService {
  /**
   * Export task as PDF
   */
  static async exportToPDF(task: HelperTask, options: ExportOptions): Promise<void> {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;
      
      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      const titleLines = pdf.splitTextToSize(task.title, maxWidth);
      pdf.text(titleLines, margin, yPosition);      yPosition += titleLines.length * 8 + 10;
      
      // Add input content
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      const contentLines = pdf.splitTextToSize(task.content, maxWidth);
      
      for (let i = 0; i < contentLines.length; i++) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(contentLines[i], margin, yPosition);
        yPosition += 6;
      }
        yPosition += 10;
      
      // Add response section if available
      if (task.response) {
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        const responseLines = pdf.splitTextToSize(task.response, maxWidth);
        
        for (let i = 0; i < responseLines.length; i++) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(responseLines[i], margin, yPosition);
          yPosition += 6;        }
      }
      
      // Save the PDF
      pdf.save(options.fileName);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }
  
  /**
   * Export task as DOCX
   */
  static async exportToDOCX(task: HelperTask, options: ExportOptions): Promise<void> {
    try {      const children: any[] = [];
      
      // Add title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: task.title,
              size: 32,
              bold: true,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );
      
      // Add input content
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: task.content,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        })
      );      
      // Add response section if available
      if (task.response) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: task.response,
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          })
        );      }
      
      const doc = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
      });
      
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = options.fileName;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      throw new Error('Failed to export DOCX');
    }
  }
  
  /**
   * Generate filename with timestamp
   */
  static generateFileName(baseName: string, format: 'pdf' | 'docx', includeTimestamp: boolean = true): string {
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
    const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
    return `${cleanBaseName}${timestamp}.${format}`;
  }
}
