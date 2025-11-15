import { CreateClientInput, UpdateClientInput } from "@/lib/validations/clients"
import { ClientWithCompany, ClientFilters } from "@/types/client"
import { useCallback, useEffect, useState } from "react"

interface UseClientsOptions {
    initialClients?: ClientWithCompany[]
    initialFilters?: ClientFilters
    autoFetch?: boolean
}

export function useClients(options: UseClientsOptions = {}) {
    const {
        initialClients = [],
        initialFilters = {},
        autoFetch = false,
    } = options

    const [clients, setClients] = useState<ClientWithCompany[]>(initialClients);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<ClientFilters>(initialFilters);
    const [totalClients, setTotalClients] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const buildQueryParams = useCallback((filterParams: ClientFilters) => {
        const params = new URLSearchParams();

        if (filterParams.search?.trim()) {
            params.append('search', filterParams.search.trim());
        }

        if (filterParams.companyId?.trim()) {
            params.append('companyId', filterParams.companyId.trim());
        }

        const queryParams = params.toString();
        return queryParams ? `?${queryParams}` : '';
    }, [])

    const fetchClients = useCallback(async (filterParams?: ClientFilters) => {
        try {
            setIsLoading(true);
            setError(null);

            // Usar los nuevos filtros o los actuales
            const currentFilters = filterParams || filters;
            const queryParams = buildQueryParams(currentFilters);

            const response = await fetch(`/api/clients${queryParams}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al cargar clientes');
            }

            const result = await response.json();
            console.log(result)

            let clientsData: ClientWithCompany[] = []
            let totalCount = 0;

            // El backend retorna { success, data, message }
            if (result.success && result.data) {
                clientsData = result.data.clients || [];
                totalCount = result.data.total || 0;
            }

            setClients(clientsData);
            setTotalClients(totalCount);
            
            // Actualizar filtros si se pasaron nuevos
            if (filterParams) {
                setFilters(currentFilters);
            }

        } catch (error) {
            console.error('Error al cargar clientes:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al cargar clientes';
            setError(errorMessage);
            setClients([]);
            setTotalClients(0);
        } finally {
            setIsLoading(false);
        }
    }, [filters, buildQueryParams]);

    const applyFilters = useCallback((newFilters: ClientFilters) => {
        return fetchClients(newFilters);
    }, [fetchClients]);

    const clearFilters = useCallback(() => {
        const emptyFilters: ClientFilters = {};
        setFilters(emptyFilters);
        return fetchClients(emptyFilters);
    }, [fetchClients]);

    const searchClients = useCallback((searchTerm: string) => {
        const newFilters = { ...filters, search: searchTerm };
        return fetchClients(newFilters);
    }, [filters, fetchClients]);
    
    const removeFilter = useCallback((key: keyof ClientFilters) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        return fetchClients(newFilters);
    }, [filters, fetchClients]);


    /**
     * Obtener cliente por ID
     */
    const fetchClientById = useCallback(async (id: string): Promise<ClientWithCompany> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`/api/clients/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al cargar cliente');
            }

            const result = await response.json();
            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar cliente';
            setError(errorMessage);
            console.error('Error al cargar cliente:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Crear cliente
     */
    const createClient = useCallback(async (data: CreateClientInput): Promise<ClientWithCompany> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al crear cliente');
            }

            const result = await response.json();
            const newClient: ClientWithCompany = result.data;

            // Actualizar lista local
            setClients(prev => [newClient, ...prev]);
            setTotalClients(prev => prev + 1);
            
            return newClient;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear cliente';
            setError(errorMessage);
            console.error('Error al crear cliente:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateClient = useCallback(async (clientId: string, data: UpdateClientInput): Promise<ClientWithCompany> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al actualizar cliente');
            }

            const result = await response.json();
            const updatedClient: ClientWithCompany = result.data;

            // Actualizar lista local
            setClients(prev =>
                prev.map(client =>
                client.id === clientId ? updatedClient : client
                )
            );
            
            return updatedClient;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cliente';
            setError(errorMessage);
            console.error('Error al actualizar cliente:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Eliminar cliente (soft delete)
     */
    const deleteClient = useCallback(async (clientId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar cliente');
            }

            // Recargar productos con los filtros actuales para reflejar el cambio
            await fetchClients(filters);
            
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cliente';
            setError(errorMessage);
            console.error('Error al eliminar cliente:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [filters, fetchClients]);



    const refreshClients = useCallback(() => {
        return fetchClients();
    }, [fetchClients]);

    /**
     * Efecto para carga automática si está habilitada
     */
    useEffect(() => {
        if (autoFetch && initialClients.length === 0) {
            fetchClients(initialFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, initialClients.length]); 

    return {
        clients,
        totalClients,
        filters,
        isLoading,
        error,
        applyFilters,
        clearFilters,
        searchClients,
        removeFilter,
        fetchClientById,
        createClient,
        updateClient,
        deleteClient,
        refreshClients,

        hasFilters: Object.keys(filters).some(key => {
            const value = filters[key as keyof ClientFilters];
            return value !== undefined && value !== null && value !== '';
        }),
        activeFiltersCount: Object.keys(filters).filter(key => 
            filters[key as keyof ClientFilters] !== undefined && 
            filters[key as keyof ClientFilters] !== null &&
            filters[key as keyof ClientFilters] !== ''
        ).length,
    }
}

export function useClientfilters() {
    const { filters, applyFilters, clearFilters, hasFilters, activeFiltersCount } = useClients();
    
    return {
        filters,
        applyFilters,
        clearFilters,
        hasFilters,
        activeFiltersCount,
    };
}