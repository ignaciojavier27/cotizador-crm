import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAuth } from "@/lib/auth/authorize";
import { createQuotation, getAllQuotations } from "@/lib/services/quotationServices";
import { createQuotationSchema } from "@/lib/validations/quotation";
import { QuotationStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuotationPDFData } from "@/types/pdf";
import { generateQuotationPDF } from "@/lib/services/pdfService";
import { sendQuotationEmail } from "@/lib/services/emailService";

// ==========================================
// POST /api/quotations - Crear cotización
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Validar datos con Zod
    const validatedData = createQuotationSchema.parse(body);

    // Crear cotización
    const quotation = await createQuotation(
      validatedData,
      user.id,
      user.companyId
    );

    // --- INICIO: Generar PDF y Enviar Correo ---
    try {
      console.log("Iniciando proceso de envío de correo...");
      // 1. Obtener datos de la empresa para el PDF
      const company = await prisma.company.findUnique({
        where: { id: user.companyId }
      });
      console.log("Empresa encontrada:", company?.name);

      if (company && quotation.client.email) {
        console.log("Cliente tiene email:", quotation.client.email);
        // 2. Preparar datos para el PDF
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
            company: company // Asignar la empresa encontrada
          },
          company: company,
        };

        // 3. Generar PDF
        console.log("Generando PDF...");
        const pdfBuffer = await generateQuotationPDF(pdfData);
        console.log("PDF generado. Tamaño:", pdfBuffer.length);

        // 4. Enviar Correo
        console.log("Enviando correo a:", quotation.client.email);
        await sendQuotationEmail({
          to: quotation.client.email,
          clientName: quotation.client.name,
          quotationNumber: quotation.quotationNumber,
          pdfBuffer: pdfBuffer,
          companyName: company.name,
        });
        console.log("Correo enviado exitosamente.");
      } else {
        console.log("No se envía correo: Falta empresa o email del cliente.");
      }
    } catch (emailError) {
      console.error("Error CRÍTICO al enviar el correo de la cotización:", emailError);
      // No fallamos la request completa si falla el correo, pero lo logueamos
    }
    // --- FIN: Generar PDF y Enviar Correo ---

    return successResponse(quotation, "Cotización creada correctamente", 201);
  } catch (error) {
    console.error("Error al crear cotización:", error);

    if (error instanceof AuthError) {
      if (error.code === "UNAUTHORIZED")
        return errorResponse(error.message, 401);
      if (error.code === "FORBIDDEN")
        return errorResponse(error.message, 403);
    }


    if (error instanceof Error && error.message.includes("ID de empresa inválido")) {
      return errorResponse(error.message, 409);
    }

    if (error instanceof Error && error.message.includes("Cliente no encontrado")) {
      return errorResponse(error.message, 404);
    }

    if (error instanceof Error && error.message.includes("productos no encontrados")) {
      return errorResponse(error.message, 404);
    }

    return serverErrorResponse("Error al crear la cotización");
  }
}

// ==========================================
// GET /api/quotations - Listar cotizaciones
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") as QuotationStatus | undefined;
    const clientId = searchParams.get("clientId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await getAllQuotations(user.companyId, {
      status,
      clientId,
      userId,
      search,
      page,
      limit
    });

    return successResponse(result, "Cotizaciones obtenidas correctamente", 200);

  } catch (error) {

    console.error("Error al listar cotizaciones:", error);

    if (error instanceof AuthError) {
      if (error.code === "UNAUTHORIZED")
        return errorResponse(error.message, 401);
      if (error.code === "FORBIDDEN")
        return errorResponse(error.message, 403);
    }

    return serverErrorResponse("Error al listar las cotizaciones");

  }
}