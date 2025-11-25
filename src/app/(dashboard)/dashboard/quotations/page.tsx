import QuotationsClient from "@/components/quotations/QuotationsClient";
import { requireAuth } from "@/lib/auth/authorize";
import { getAllQuotations } from "@/lib/services/quotationServices";
import { QuotationDashboard, QuotationsPageResult, QuotationWithRelations } from "@/types/quotation";
import { QuotationStatus } from "@prisma/client";
import { redirect } from "next/navigation";


async function getQuotationsData(
  companyId: string,
  searchParams?: {
    status?: string;
    clientId?: string;
    userId?: string;
    search?: string;
    page?: string;
    limit?: string;
  }
): Promise<QuotationsPageResult> {
  try {
    const filters = {
      status: searchParams?.status as QuotationStatus | undefined,
      clientId: searchParams?.clientId,
      userId: searchParams?.userId,
      search: searchParams?.search,
      page: searchParams?.page ? parseInt(searchParams.page) : 1,
      limit: searchParams?.limit ? parseInt(searchParams.limit) : 10,
    };

    const result = await getAllQuotations(companyId, filters);

    // Transformar datos para el dashboard
    const quotations: QuotationDashboard[] = result.quotations.map((q: QuotationWithRelations) => ({
      id: q.id,
      quotationNumber: q.quotationNumber,
      createdAt: q.createdAt,
      status: q.status,
      total: Number(q.total),
      totalTax: Number(q.totalTax),
      expiresAt: q.expiresAt,
      client: {
        id: q.client.id,
        name: q.client.name,
        email: q.client.email,
        phone: q.client.phone,
      },
      user: {
        id: q.user.id,
        firstName: q.user.firstName,
        lastName: q.user.lastName,
        email: q.user.email,
      },
      _count: {
        details: q.details?.length || 0,
      },
    }));

    return {
      quotations,
      pagination: result.pagination
    };
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error);
    throw error;
  }
}

interface QuotationsPageProps {
  searchParams: {
    status?: string;
    clientId?: string;
    userId?: string;
    search?: string;
    page?: string;
    limit?: string;
  };
}

export default async function QuotationsPage({ searchParams }: QuotationsPageProps) {
  let user;

  try {
    user = await requireAuth();

    if (!user?.companyId) {
      console.warn("Usuario sin companyId, redirigiendo a dashboard");
      redirect("/dashboard");
    }

    // ✅ Await searchParams
    const resolvedSearchParams = await searchParams;

    const [quotationsData] = await Promise.allSettled([
      getQuotationsData(user.companyId, resolvedSearchParams),
    ]);

    const quotations =
      quotationsData.status === "fulfilled"
        ? quotationsData.value.quotations
        : [];
    const pagination =
      quotationsData.status === "fulfilled"
        ? quotationsData.value.pagination
        : { total: 0, page: 1, limit: 10, totalPages: 0 };

    if (process.env.NODE_ENV === "development") {
      console.log(
        `📦 Cargadas ${quotations.length} cotizaciones de ${pagination.total} totales`
      );
    }

    return (
      <QuotationsClient
        initialQuotations={quotations}
        pagination={pagination}
        filters={{
          status: resolvedSearchParams.status as QuotationStatus | undefined,
          clientId: resolvedSearchParams.clientId,
          userId: resolvedSearchParams.userId,
          search: resolvedSearchParams.search,
        }}
      />
    );
  } catch (error) {
    console.error("Error al cargar las cotizaciones:", error);

    if (error instanceof Error && error.message.includes("auth")) {
      redirect("/login");
    }

    return (
      <QuotationsClient
        initialQuotations={[]}
        pagination={{ total: 0, page: 1, limit: 10, totalPages: 0 }}
        filters={{}}
      />
    );
  }
}
export const metadata = {
  title: "Cotizaciones | Dashboard",
  description: "Gestión de cotizaciones",
};