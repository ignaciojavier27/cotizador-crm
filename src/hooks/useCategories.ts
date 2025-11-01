import { useState, useCallback } from 'react';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CategoryDB {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export function useCategories(initialCategories: Category[] = []) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      const url = search 
        ? `/api/categories?search=${encodeURIComponent(search)}`
        : '/api/categories';
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }

      const result = await response.json();
      
      const transformedCategories = result.data.categories.map((cat: CategoryDB) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        createdAt: typeof cat.createdAt === 'string' 
          ? cat.createdAt 
          : cat.createdAt.toISOString(),
      }));
      
      setCategories(transformedCategories);
      return transformedCategories;
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear categoría');
      }

      const result = await response.json();
      
      const newCategory: Category = {
        id: result.data.id,
        name: result.data.name,
        description: result.data.description,
        createdAt: result.data.createdAt,
      };

      setCategories(prev => [newCategory, ...prev]);
      return result.data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoryById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar categoría');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error al cargar categoría:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [])

  const updateCategory = useCallback(async (id: string, data: {
    name?: string;
    description?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar categoría');
      }

      const result = await response.json();
      
      setCategories(prev =>
        prev.map(cat =>
          cat.id === id
            ? {
                ...cat,
                name: result.data.name,
                description: result.data.description,
              }
            : cat
        )
      );

      return result.data;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar categoría');
      }

      setCategories(prev => prev.filter(cat => cat.id !== id));
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    setCategories,
    isLoading,
    fetchCategoryById,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}