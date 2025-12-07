import { CreateTaxData, TaxFilters, TaxFull, UpdateTaxData } from "@/types/tax";
import { useCallback, useEffect, useState } from "react";

interface UseTaxesOptions {
    initialTaxes?: TaxFull[];
    initialFilters?: TaxFilters;
    autoFetch?: boolean;
}

export function useTaxes(options: UseTaxesOptions = {}) {

    const {
        initialTaxes = [],
        initialFilters = {},
        autoFetch = false,
    } = options;

    const [taxes, setTaxes] = useState<TaxFull[]>(initialTaxes);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<TaxFilters>(initialFilters);
    const [totalTaxes, setTotalTaxes] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const buildQueryParams = useCallback((filterParams: TaxFilters) => {
        const params = new URLSearchParams();

        if (filterParams.search?.trim()) {
            params.append('search', filterParams.search.trim());
        }

        if (filterParams.isActive !== undefined && filterParams.isActive !== null) {
            params.append('isActive', String(filterParams.isActive));
        }

        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    }, []);

    const fetchTaxes = useCallback(async (filterParams?: TaxFilters): Promise<TaxFull[]> => {
        try {
            setIsLoading(true);
            setError(null);

            const currentFilters = filterParams || filters;
            const queryParams = buildQueryParams(currentFilters);

            const response = await fetch(`/api/taxes${queryParams}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al cargar impuestos');
            }

            const result = await response.json();

            let taxesData: TaxFull[] = [];
            let totalCount = 0;

            if (result.data?.taxes) {
                taxesData = result.data.taxes;
                totalCount = result.data.total;
            } else if (Array.isArray(result.data)) {
                taxesData = result.data;
                totalCount = result.data.length;
            } else if (Array.isArray(result)) {
                taxesData = result;
                totalCount = result.length;
            }

            setTaxes(taxesData);
            setTotalTaxes(totalCount);

            if (filterParams) {
                setFilters(filterParams);
            }

            return taxesData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar impuestos';
            setError(errorMessage);
            console.error('Error al cargar impuestos:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [filters, buildQueryParams]);

    const applyFilters = useCallback((newFilters: TaxFilters) => {
        return fetchTaxes(newFilters);
    }, [fetchTaxes]);

    const clearFilters = useCallback(() => {
        const emptyFilters: TaxFilters = {};
        setFilters(emptyFilters);
        return fetchTaxes(emptyFilters);
    }, [fetchTaxes]);

    const searchTaxes = useCallback((searchTerm: string) => {
        const newFilters = { ...filters, search: searchTerm };
        return fetchTaxes(newFilters);
    }, [filters, fetchTaxes]);

    const filterByStatus = useCallback((isActive: boolean | null) => {
        const newFilters = { ...filters, isActive };
        return fetchTaxes(newFilters);
    }, [filters, fetchTaxes]);

    const removeFilter = useCallback((key: keyof TaxFilters) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        return fetchTaxes(newFilters);
    }, [filters, fetchTaxes]);

    const fetchTaxById = useCallback(async (id: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/taxes/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al cargar impuesto');
            }

            const result = await response.json();
            return result.data.data; // Note: API wrap might return { data: { data: Tax } } or just { data: Tax } depending on response util. 
            // Checking api-response util, successResponse(data) > { status: 'success', data }
            // So if I return { data: tax } it is { status: 'success', data: { data: tax } }
            // Let's verify route.ts implementations.
            // GET /api/taxes/[id] returns successResponse({ data: tax })
            // So response json is { status, data: { data: tax } }
            // So result.data.data is correct.
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar impuesto';
            setError(errorMessage);
            console.error('Error al cargar impuesto:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createTax = useCallback(async (data: CreateTaxData): Promise<TaxFull> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/taxes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al crear impuesto');
            }

            const result = await response.json();
            const newTax: TaxFull = result.data;

            setTaxes(prev => [newTax, ...prev]);
            setTotalTaxes(prev => prev + 1);

            return newTax;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear impuesto';
            setError(errorMessage);
            console.error('Error al crear impuesto:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateTax = useCallback(async (taxId: string, data: UpdateTaxData): Promise<TaxFull> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/taxes/${taxId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al actualizar impuesto');
            }

            const result = await response.json();
            const updatedTax: TaxFull = result.data.data;

            setTaxes(prev =>
                prev.map(tax =>
                    tax.id === taxId ? updatedTax : tax
                )
            );

            return updatedTax;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar impuesto';
            setError(errorMessage);
            console.error('Error al actualizar impuesto:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteTax = useCallback(async (taxId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/taxes/${taxId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar impuesto');
            }

            await fetchTaxes(filters);

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar impuesto';
            setError(errorMessage);
            console.error('Error al eliminar impuesto:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [filters, fetchTaxes]);

    const refreshTaxes = useCallback(() => {
        return fetchTaxes();
    }, [fetchTaxes]);

    useEffect(() => {
        if (autoFetch && initialTaxes.length === 0) {
            fetchTaxes(initialFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, initialTaxes.length]);

    return {
        taxes,
        isLoading,
        filters,
        totalTaxes,
        error,
        fetchTaxes,
        fetchTaxById,
        createTax,
        updateTax,
        deleteTax,
        refreshTaxes,
        applyFilters,
        clearFilters,
        searchTaxes,
        filterByStatus,
        removeFilter,
        hasFilters: Object.keys(filters).length > 0,
        activeFiltersCount: Object.keys(filters).filter(key =>
            filters[key as keyof TaxFilters] !== undefined &&
            filters[key as keyof TaxFilters] !== null &&
            filters[key as keyof TaxFilters] !== ''
        ).length,
    };
}
