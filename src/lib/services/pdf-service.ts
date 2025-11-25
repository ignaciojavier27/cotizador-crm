export class PDFService {
  static async generateQuotationPDF(quotationId: string): Promise<Blob> {
    const response = await fetch(`/api/quotations/${quotationId}/generate-pdf`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error generando PDF' }));
      throw new Error(errorData.error || 'Error generando PDF');
    }

    return await response.blob();
  }

  static downloadPDF(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static openPDFInNewTab(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Limpiar después de un tiempo
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  }
}                                                                   