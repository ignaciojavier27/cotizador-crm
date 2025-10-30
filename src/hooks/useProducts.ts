import { CreateProductData, ProductFilters, ProductFull, UpdateProductData } from "@/types/product";
import { useCallback, useEffect, useState } from "react";


interface UseProductsOptions {
    initialProducts?: ProductFull[];
    initialFilters?: ProductFilters;
    autoFetch?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {

    const {
        initialProducts = [],
        initialFilters = {},
        autoFetch = false,
    } = options;

    const [products, setProducts] = useState<ProductFull[]>(initialProducts);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>(initialFilters);
    const [totalProducts, setTotalProducts] = useState(0);
    const [error, setError] = useState<string | null>(null);

    /**
     * Construye query params a partir de los filtros
     */
    const buildQueryParams = useCallback((filterParams: ProductFilters) => {
        const params = new URLSearchParams();
        
        if (filterParams.search?.trim()) {
            params.append('search', filterParams.search.trim());
        }
        
        if (filterParams.isActive !== undefined && filterParams.isActive !== null) {
            params.append('isActive', String(filterParams.isActive));
        }
        
        if (filterParams.categoryId?.trim()) {
            params.append('categoryId', filterParams.categoryId.trim());
        }
        
        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    }, []);


    /**
     * Obtener todos los productos con filtros opcionales
     */
    const fetchProducts = useCallback(async (filterParams?: ProductFilters): Promise<ProductFull[]> => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Usar los nuevos filtros o los actuales
            const currentFilters = filterParams || filters;
            const queryParams = buildQueryParams(currentFilters);
            
            const response = await fetch(`/api/products${queryParams}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al cargar productos');
            }

            const result = await response.json();
            
            // Manejar diferentes estructuras de respuesta
            let productsData: ProductFull[] = [];
            let totalCount = 0;

            if (result.data?.products) {
                // Si viene en formato ProductsResponse
                productsData = result.data.products;
                totalCount = result.data.total;
            } else if (Array.isArray(result.data)) {
                // Si viene como array directo
                productsData = result.data;
                totalCount = result.data.length;
            } else if (Array.isArray(result)) {
                // Si la respuesta es el array directamente
                productsData = result;
                totalCount = result.length;
            }

            setProducts(productsData);
            setTotalProducts(totalCount);
            
            // Actualizar filtros solo si se proporcionaron nuevos
            if (filterParams) {
                setFilters(filterParams);
            }
            
            return productsData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
            setError(errorMessage);
            console.error('Error al cargar productos:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [filters, buildQueryParams]);

    /**
     * Aplicar filtros (wrapper para mayor claridad)
     */
    const applyFilters = useCallback((newFilters: ProductFilters) => {
        return fetchProducts(newFilters);
    }, [fetchProducts]);

    /**
     * Limpiar filtros
     */
    const clearFilters = useCallback(() => {
        const emptyFilters: ProductFilters = {};
        setFilters(emptyFilters);
        return fetchProducts(emptyFilters);
    }, [fetchProducts]);

    /**
     * Buscar productos por texto
     */
    const searchProducts = useCallback((searchTerm: string) => {
        const newFilters = { ...filters, search: searchTerm };
        return fetchProducts(newFilters);
    }, [filters, fetchProducts]);

    /**
     * Filtrar por estado activo/inactivo
     */
    const filterByStatus = useCallback((isActive: boolean | null) => {
        const newFilters = { ...filters, isActive };
        return fetchProducts(newFilters);
    }, [filters, fetchProducts]);

    /**
     * Filtrar por categoría
     */
    const filterByCategory = useCallback((categoryId: string) => {
        const newFilters = { ...filters, categoryId };
        return fetchProducts(newFilters);
    }, [filters, fetchProducts]);


    /**
     * Remover filtro específico
     */
    const removeFilter = useCallback((key: keyof ProductFilters) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        return fetchProducts(newFilters);
    }, [filters, fetchProducts]);


    /**
     * Obtener producto por ID
     */
    const fetchProductById = useCallback(async (id: string): Promise<ProductFull> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`/api/products/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al cargar producto');
            }

            const result = await response.json();
            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar producto';
            setError(errorMessage);
            console.error('Error al cargar producto:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Crear producto
     */
    const createProduct = useCallback(async (data: CreateProductData): Promise<ProductFull> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al crear producto');
            }

            const result = await response.json();
            const newProduct: ProductFull = result.data;

            // Actualizar lista local
            setProducts(prev => [newProduct, ...prev]);
            setTotalProducts(prev => prev + 1);
            
            return newProduct;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
            setError(errorMessage);
            console.error('Error al crear producto:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Actualizar producto
     */
    const updateProduct = useCallback(async (productId: string, data: UpdateProductData): Promise<ProductFull> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al actualizar producto');
            }

            const result = await response.json();
            const updatedProduct: ProductFull = result.data;

            // Actualizar lista local
            setProducts(prev =>
                prev.map(product =>
                product.id === productId ? updatedProduct : product
                )
            );
            
            return updatedProduct;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
            setError(errorMessage);
            console.error('Error al actualizar producto:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Eliminar producto (soft delete)
     */
    const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar producto');
            }

            // Recargar productos con los filtros actuales para reflejar el cambio
            await fetchProducts(filters);
            
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
            setError(errorMessage);
            console.error('Error al eliminar producto:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [filters, fetchProducts]);


    /**
     * Refrescar productos con filtros actuales
     */
    const refreshProducts = useCallback(() => {
        return fetchProducts();
    }, [fetchProducts]);

    /**
     * Efecto para carga automática si está habilitada
     */
    useEffect(() => {
        if (autoFetch && initialProducts.length === 0) {
            fetchProducts(initialFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, initialProducts.length]); 

    return {
        // Estado
        products,
        isLoading,
        filters,
        totalProducts,
        error,
        
        // Métodos CRUD
        fetchProducts,
        fetchProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        
        // Métodos de filtrado
        applyFilters,
        clearFilters,
        searchProducts,
        filterByStatus,
        filterByCategory,
        removeFilter,
        
        // Utilidades
        hasFilters: Object.keys(filters).length > 0,
        activeFiltersCount: Object.keys(filters).filter(key => 
            filters[key as keyof ProductFilters] !== undefined && 
            filters[key as keyof ProductFilters] !== null &&
            filters[key as keyof ProductFilters] !== ''
        ).length,
    };
}

// Hook derivado para uso común
export function useProductFilters() {
  const { filters, applyFilters, clearFilters, hasFilters, activeFiltersCount } = useProducts();
  
  return {
    filters,
    applyFilters,
    clearFilters,
    hasFilters,
    activeFiltersCount,
  };
}