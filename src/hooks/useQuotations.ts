import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuotationDashboard } from "@/types/quotation";
import { QuotationStatus } from "@prisma/client";

interface QuotationFilters {
  status?: QuotationStatus;
  clientId?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseQuotationsProps {
  initialQuotations: QuotationDashboard[];
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  initialFilters?: QuotationFilters;
  autoFetch?: boolean;
}

export function useQuotations({
  initialQuotations,
  initialPagination,
  initialFilters = {},
  autoFetch = false,
}: UseQuotationsProps) {
  const router = useRouter();

  const [quotations, setQuotations] = useState<QuotationDashboard[]>(initialQuotations);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState<QuotationFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== null && value !== ""
  ).length;

  const hasFilters = activeFiltersCount > 0;

  /**
   * Construir query string desde filtros
   */
  const buildQueryString = useCallback((filterObj: QuotationFilters): string => {
    const params = new URLSearchParams();

    Object.entries(filterObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    return params.toString();
  }, []);

  /**
   * Fetch cotizaciones desde API
   */
  const fetchQuotations = useCallback(
    async (filterObj: QuotationFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryString = buildQueryString(filterObj);
        const response = await fetch(`/api/quotations?${queryString}`);

        if (!response.ok) {
          throw new Error("Error al cargar cotizaciones");
        }

        const data = await response.json();
        setQuotations(data.quotations || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
      } catch (err) {
        console.error("Error fetching quotations:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setQuotations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [buildQueryString]
  );

  /**
   * Aplicar filtros (actualiza URL y recarga)
   */
  const applyFilters = useCallback(
    (newFilters: QuotationFilters) => {
      setFilters(newFilters);
      const queryString = buildQueryString(newFilters);
      router.push(`/dashboard/quotations${queryString ? `?${queryString}` : ""}`);
    },
    [buildQueryString, router]
  );

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({});
    router.push("/dashboard/quotations");
  }, [router]);

  /**
   * Cambiar página
   */
  const changePage = useCallback(
    (page: number) => {
      applyFilters({ ...filters, page });
    },
    [filters, applyFilters]
  );

  /**
   * Eliminar cotización
   */
  const deleteQuotation = useCallback(
    async (quotationId: string) => {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar cotización");
      }

      // Recargar lista
      router.refresh();
    },
    [router]
  );

  /**
   * Actualizar estado de cotización
   */
  const updateQuotationStatus = useCallback(
    async (
      quotationId: string,
      status: QuotationStatus,
      rejectionReason?: string,
      changeReason?: string
    ) => {
      const response = await fetch(`/api/quotations/${quotationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          rejectionReason,
          changeReason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar estado");
      }

      // Recargar lista
      router.refresh();
    },
    [router]
  );

  /**
   * Auto-fetch al montar si está habilitado
   */
  useEffect(() => {
    if (autoFetch) {
      fetchQuotations(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  // Sincronizar estado local cuando cambian las props (ej: después de router.refresh())
  useEffect(() => {
    setQuotations(initialQuotations);
    setPagination(initialPagination);
  }, [initialQuotations, initialPagination]);

  return {
    quotations,
    pagination,
    isLoading,
    error,
    filters,
    hasFilters,
    activeFiltersCount,
    applyFilters,
    clearFilters,
    changePage,
    deleteQuotation,
    updateQuotationStatus,
    totalQuotations: pagination.total,
  };
}