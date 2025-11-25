import { z } from "zod";

const quotationDetailSchema = z.object({
  productId: z.string().min(1, "ID de producto requerido"),
  quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
  unitPrice: z.number().positive("El precio unitario debe ser mayor a 0"),
  // subtotal y lineTax se calculan automáticamente en el backend
});

export const createQuotationSchema = z.object({
  clientId: z.string().min(1, "ID de cliente requerido"),
  expiresAt: z.string().optional(),
  internalNotes: z.string().max(1000, "Las notas internas no pueden exceder 1000 caracteres").optional(),
  details: z.array(quotationDetailSchema)
    .min(1, "Debe incluir al menos un producto en la cotización")
    .max(100, "No se pueden agregar más de 100 productos"),
  // userId y companyId se obtienen de la sesión
  // quotationNumber se genera automáticamente
  // total, totalTax se calculan automáticamente
  // status por defecto es 'sent'
  // sentAt se establece automáticamente
});

export const updateQuotationSchema = z.object({
  clientId: z.string().min(1, "ID de cliente requerido").optional(),
  expiresAt: z.string().optional().nullable(),
  internalNotes: z.string().max(1000, "Las notas internas no pueden exceder 1000 caracteres").optional().nullable(),
  details: z.array(quotationDetailSchema)
    .min(1, "Debe incluir al menos un producto en la cotización")
    .max(100, "No se pueden agregar más de 100 productos")
    .optional(),
  // Solo se puede actualizar si el status es 'sent'
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Debe proporcionar al menos un campo para actualizar" }
);



export const updateQuotationStatusSchema = z.object({
  status: z.enum(["sent", "accepted", "rejected", "expired"], {
    message: "Estado no válido. Debe ser: sent, accepted, rejected o expired"
  }),
  rejectionReason: z.string()
    .max(500, "El motivo de rechazo no puede exceder 500 caracteres")
    .optional(),
  changeReason: z.string()
    .max(500, "El motivo del cambio no puede exceder 500 caracteres")
    .optional(),
}).refine(
  (data) => {
    // Si el estado es 'rejected', debe incluir un motivo
    if (data.status === "rejected" && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: "Debe proporcionar un motivo cuando se rechaza una cotización",
    path: ["rejectionReason"]
  }
);

// Tipos TypeScript inferidos
export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
export type UpdateQuotationStatusInput = z.infer<typeof updateQuotationStatusSchema>;
export type QuotationDetailInput = z.infer<typeof quotationDetailSchema>;