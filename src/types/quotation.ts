import { Prisma, QuotationStatus } from "@prisma/client";

export type QuotationWithRelations = Prisma.QuotationGetPayload<{
  include: {
    client: {
      select: {
        id: true;
        name: true;
        email: true;
        phone: true;
      };
    };
    user: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
      };
    };
    details: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            description: true;
          };
        };
      };
    };
  };
}>;

export interface QuotationDashboard {
  id: string;
  quotationNumber: string;
  createdAt: Date;
  status: QuotationStatus;
  total: number;
  totalTax: number;
  expiresAt: Date | null;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    details: number;
  };
}

export interface QuotationsPageResult {
  quotations: QuotationDashboard[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}