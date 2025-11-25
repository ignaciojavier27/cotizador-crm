'use client';

import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PDFButtonsProps {
  quotationId: string;
  quotationNumber: string;
}

export function PDFButtons({ quotationId, quotationNumber }: PDFButtonsProps) {
  const { generateQuotationPDF, isGenerating } = usePDFGenerator();

  const handleGeneratePDF = async (action: 'view' | 'download'): Promise<void> => {
    const result = await generateQuotationPDF(quotationId, quotationNumber);
    
    if (result.success && result.blob) {
      if (action === 'view' && result.open) {
        result.open();
        toast.success('PDF generado correctamente');
      } else if (action === 'download' && result.download) {
        result.download();
        toast.success('PDF descargado correctamente');
      }
    } else {
      toast.error(result.error || 'Error generando PDF');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleGeneratePDF('view')}
        disabled={isGenerating}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Ver PDF
      </Button>
      
      <Button
        onClick={() => handleGeneratePDF('download')}
        disabled={isGenerating}
        variant="default"
        size="sm"
        className="flex items-center gap-2"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Descargar PDF
      </Button>
    </div>
  );
}