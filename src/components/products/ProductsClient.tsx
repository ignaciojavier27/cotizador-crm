'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search, Pencil, Trash2, Package, Filter, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { confirmDelete } from '@/utils/confirmation';
import { notify } from '@/utils/notifications';
import { ProductsClientProps } from '@/types/product';
import { getStatusBadgeColor } from '@/utils/presentation';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/price';

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const router = useRouter();

  // Hook centralizado
  const {
    products,
    isLoading,
    totalProducts,
    filters,
    applyFilters,
    clearFilters,
    deleteProduct,
    hasFilters,
    activeFiltersCount,
    error,
  } = useProducts({
    initialProducts,
    initialFilters: {},
    autoFetch: initialProducts.length === 0,
  });

  // Estado local para inputs
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryInput, setCategoryInput] = useState('all');

  /**
   * Debounce para búsqueda
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      applyFilters({
        ...filters,
        search: searchInput.trim() || undefined,
      });
    }, 400);

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]); // Solo depende de searchInput

  /**
   * Manejar cambio de estado
   */
  const handleStatusChange = useCallback((value: 'all' | 'active' | 'inactive') => {
    setStatusInput(value);
    
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters.isActive;
    } else {
      newFilters.isActive = value === 'active';
    }
    
    applyFilters(newFilters);
  }, [filters, applyFilters]);

  /**
   * Manejar cambio de categoría
   */
  const handleCategoryChange = useCallback((value: string) => {
    setCategoryInput(value);
    
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters.categoryId;
    } else {
      newFilters.categoryId = value;
    }
    
    applyFilters(newFilters);
  }, [filters, applyFilters]);

  /**
   * Limpiar todos los filtros
   */
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setStatusInput('all');
    setCategoryInput('all');
    clearFilters();
  }, [clearFilters]);

  /**
   * Filtro rápido de estado
   */
  const handleQuickStatusFilter = useCallback((status: boolean | null) => {
    if (status === null) {
      handleStatusChange('all');
    } else {
      handleStatusChange(status ? 'active' : 'inactive');
    }
  }, [handleStatusChange]);

  /**
   * Eliminar producto
   */
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirmDelete(productName)) return;
    try {
      await deleteProduct(productId);
      notify.success('Producto eliminado correctamente');
    } catch {
      notify.error('Error al eliminar el producto');
    }
  };

  /**
   * Badge de filtros activos
   */
  const renderFiltersBadge = () => {
    if (!hasFilters || activeFiltersCount === 0) return null;
    
    return (
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Filter className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-700">
          {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} aplicado{activeFiltersCount !== 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-auto p-1 text-blue-600 hover:text-blue-800"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  /**
   * Contenido de la tabla
   */
  const renderTableContent = () => {
    if (isLoading && products.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <p className="mt-2 text-gray-500">Cargando productos...</p>
          </TableCell>
        </TableRow>
      );
    }

    if (products.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
            {hasFilters ? 'No hay productos que coincidan con los filtros' : 'No se encontraron productos'}
          </TableCell>
        </TableRow>
      );
    }

    return products.map((product) => (
      <TableRow key={product.id}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                {product.description || 'Sin descripción'}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">{product.category?.name || '-'}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm">{product.type || '-'}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">{product.brand || '-'}</span>
        </TableCell>
        <TableCell>
          <div>
            <div className="font-medium">{formatPrice(product.basePrice)}</div>
            {product.taxPercentage > 0 && (
              <div className="text-xs text-gray-500">+{product.taxPercentage}% IVA</div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge 
            variant={product.isActive ? "default" : "secondary"}
            className={getStatusBadgeColor(product.isActive)}
          >
            {product.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-gray-600">
          {formatDate(product.createdAt)}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/products/edit/${product.id}`)}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteProduct(product.id, product.name)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-gray-600 mt-1">Administra el catálogo de productos de tu empresa</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/products/create')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Alertas de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Buscar */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, descripción o marca..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Estado */}
          <Select value={statusInput} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Estado del producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Solo activos</SelectItem>
              <SelectItem value="inactive">Solo inactivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Categoría */}
          <Select value={categoryInput} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Badge de filtros activos */}
        {renderFiltersBadge()}

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={statusInput === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickStatusFilter(null)}
          >
            Todos
          </Button>
          <Button
            variant={statusInput === 'active' ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickStatusFilter(true)}
          >
            Activos
          </Button>
          <Button
            variant={statusInput === 'inactive' ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickStatusFilter(false)}
          >
            Inactivos
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio Base</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </div>

      {/* Resumen y paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-sm text-gray-600">
          Mostrando {products.length} de {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
          {hasFilters && ' (filtrados)'}
        </div>
        
        {(hasFilters && activeFiltersCount > 0 )&& (
          <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}