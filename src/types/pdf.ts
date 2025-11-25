export interface Company {
  id: string;
  name: string;
  rut: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
}

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  clientCompany?: string | null;
  referenceContact?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  brand?: string | null;
  basePrice: number;
  taxPercentage?: number | null;
}

export interface QuotationDetail {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number | null;
  lineTax?: number | null;
  product: Product;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  total?: number | null;
  totalTax?: number | null;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  sentAt?: Date | null;
  expiresAt?: Date | null;
  internalNotes?: string | null;
  createdAt: Date;
  client: Client;
  company: Company;
  details: QuotationDetail[];
}

export interface QuotationPDFData {
  quotation: Quotation;
  company: Company;
}