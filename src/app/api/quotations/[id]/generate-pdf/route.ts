import { NextRequest, NextResponse } from 'next/server';
import { Browser } from 'puppeteer-core';
import { generateQuotationHTML } from '@/lib/pdf-template';
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

    // Generar el HTML del PDF
    const htmlContent = generateQuotationHTML(pdfData);

    // Configurar Puppeteer para generar el PDF
    let browser: Browser | undefined;

    try {
      // En producción, usar puppeteer-core con chrome-aws-lambda
      if (process.env.NODE_ENV === 'production') {
        const chrome = await import('chrome-aws-lambda');
        const puppeteerCore = await import('puppeteer-core');

        browser = await puppeteerCore.default.launch({
          args: [...chrome.default.args, '--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: await chrome.default.executablePath,
          headless: chrome.default.headless,
        }) as unknown as Browser;
      } else {
        // En desarrollo, usar puppeteer completo
        const puppeteer = await import('puppeteer');
        browser = await puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }) as unknown as Browser;
      }

      const page = await browser.newPage();

      // Establecer el contenido HTML
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });

      const pdfBuffer = await page.pdf({
        format: 'a4',
        printBackground: true,
        margin: {
          top: '15px',
          right: '15px',
          bottom: '15px',
          left: '15px',
        },
      });

      await browser.close();

      // SOLUCIÓN: Usar Uint8Array que siempre es compatible
      const uint8Array = new Uint8Array(pdfBuffer);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="cotizacion-${quotation.quotationNumber}.pdf"`
        }
      });

    } catch (puppeteerError) {
      console.error('Error con Puppeteer:', puppeteerError);
      if (browser) {
        await browser.close();
      }
      throw new Error(`Error generando PDF: ${puppeteerError instanceof Error ? puppeteerError.message : 'Error desconocido'}`);
    }

  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}