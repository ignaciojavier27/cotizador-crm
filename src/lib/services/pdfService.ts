import { Browser } from 'puppeteer-core';
import { generateQuotationHTML } from '@/lib/pdf-template';
import { QuotationPDFData } from '@/types/pdf';

export async function generateQuotationPDF(pdfData: QuotationPDFData): Promise<Buffer> {
    const htmlContent = generateQuotationHTML(pdfData);
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
        return Buffer.from(pdfBuffer);

    } catch (puppeteerError) {
        console.error('Error con Puppeteer:', puppeteerError);
        if (browser) {
            await browser.close();
        }
        throw new Error(`Error generando PDF: ${puppeteerError instanceof Error ? puppeteerError.message : 'Error desconocido'}`);
    }
}
