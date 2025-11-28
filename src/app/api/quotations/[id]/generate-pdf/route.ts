import { NextRequest, NextResponse } from 'next/server';
import { generateQuotationPDF } from '@/lib/services/pdfService';
import { QuotationPDFData } from '@/types/pdf';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/authorize';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const quotationId = await params.id;

    // Obtener la cotización con toda la información relacionada
    const quotation = await prisma.quotation.findUnique({
      where: {
        id: quotationId,
        companyId: user.companyId,
      },
      include: {
        client: true,
        details: {
          include: {
            product: true,
          },
        },
        company: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    // Preparar datos para el PDF
    const pdfData: QuotationPDFData = {
      quotation: {
        ...quotation,
        total: quotation.total ? Number(quotation.total) : null,
        totalTax: quotation.totalTax ? Number(quotation.totalTax) : null,
        details: quotation.details.map(detail => ({
          ...detail,
          unitPrice: Number(detail.unitPrice),
          subtotal: detail.subtotal ? Number(detail.subtotal) : null,
          lineTax: detail.lineTax ? Number(detail.lineTax) : null,
          product: {
            ...detail.product,
            basePrice: Number(detail.product.basePrice),
            taxPercentage: detail.product.taxPercentage ? Number(detail.product.taxPercentage) : null,
          },
        })),
      },
      company: quotation.company,
    };

    // Generar el PDF usando el servicio
    const pdfBuffer = await generateQuotationPDF(pdfData);

    // SOLUCIÓN: Usar Uint8Array que siempre es compatible
    const uint8Array = new Uint8Array(pdfBuffer);
    const blob = new Blob([uint8Array], { type: 'application/pdf' });

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cotizacion-${quotation.quotationNumber}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}