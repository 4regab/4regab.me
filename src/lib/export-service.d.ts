import { ExportOptions, HelperTask } from '@/types/helper';
export declare class ExportService {
    /**
     * Export task as PDF
     */
    static exportToPDF(task: HelperTask, options: ExportOptions): Promise<void>;
    /**
     * Export task as DOCX
     */
    static exportToDOCX(task: HelperTask, options: ExportOptions): Promise<void>;
    /**
     * Generate filename with timestamp
     */
    static generateFileName(baseName: string, format: 'pdf' | 'docx', includeTimestamp?: boolean): string;
}
