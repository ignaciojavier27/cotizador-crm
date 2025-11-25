import { PDFService } from '@/lib/services/pdf-service';
import { useState } from 'react';

interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  download?: () => void;
  open?: () => void;
}

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuotationPDF = async (quotationId: string, quotationNumber: string): Promise<PDFGenerationResult> => {
    setIsGenerating(true);
    setError(null);

    try {
      const pdfBlob = await PDFService.generateQuotationPDF(quotationId);
      
      return {
        success: true,
        blob: pdfBlob,
        download: () => PDFService.downloadPDF(pdfBlob, `cotizacion-${quotationNumber}.pdf`),
        open: () => PDFService.openPDFInNewTab(pdfBlob),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando PDF';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateQuotationPDF,
    isGenerating,
    error,
    clearError: () => setError(null),
  };
};