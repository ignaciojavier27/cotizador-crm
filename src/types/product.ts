import { Category } from "./category";

/**
 * Base mínima de producto
 */
export interface ProductBase {
  id: string;
  name: string;
  description: string;
  type: string;
  brand: string;
  basePrice: number;
  taxPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Conteo de relaciones para producto
 */
export interface ProductCount {
  quotationDetails: number;
}

/**
 * Producto con relaciones completas
 */
export interface ProductFull extends ProductBase {
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
  categoryId?: string;
  category?: Category | null;
  _count?: ProductCount;
}

/**
 * Producto simplificado para selectores y listas básicas
 */
export interface ProductSimple {
  id: string;
  name: string;
  basePrice: number;
  taxPercentage: number;
  brand: string;
  type: string;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Filtros de búsqueda para productos
 */
export interface ProductFilters {
  search?: string;
  isActive?: boolean | null;
  categoryId?: string;
}

/**
 * Parámetros de consulta para productos (usado en servicios)
 */
export interface ProductQueryParams {
  companyId: string;
  isActive?: string | null;
  search?: string | null;
  categoryId?: string | null;
}

/**
 * Respuesta de listado con metadatos
 */
export interface ProductsResponse {
  products: ProductFull[];
  total: number;
  filters: {
    search: string;
    company: string;
    isActive: string;
    categoryId: string;
  };
}

/**
 * Respuesta para productos activos (selectores)
 */
export interface ActiveProductsResponse {
  products: ProductSimple[];
}

/**
 * Datos para crear un nuevo producto
 */
export interface CreateProductData {
  name: string;
  description?: string;
  type?: string;
  brand?: string;
  basePrice: number;
  taxPercentage?: number;
  isActive: boolean;
  categoryId?: string;
}

/**
 * Datos para actualizar un producto existente
 */
export interface UpdateProductData {
  name?: string;
  description?: string;
  type?: string;
  brand?: string;
  basePrice?: number;
  taxPercentage?: number;
  isActive?: boolean;
  categoryId?: string;
}

/**
 * Datos de formulario para producto (frontend)
 */
export interface ProductFormData {
  name: string;
  description: string;
  type: string;
  brand: string;
  basePrice: string;
  taxPercentage: string;
  isActive: boolean;
  categoryId?: string;
}

/**
 * Props para componentes de filtros de productos
 */
export interface ProductFiltersProps {
  onSearch: (search: string) => void;
  onFilterStatus: (status: boolean | null) => void;
  onFilterCategory: (categoryId: string) => void;
  onClearFilters: () => void;
  categories?: Category[];
  currentFilters: ProductFilters;
  totalProducts: number;
}

/**
 * Props para el componente principal de productos
 */
export interface ProductsClientProps {
  initialProducts: ProductFull[];
  categories: Category[];
  totalProducts: number;
}

/**
 * Props para formularios de producto
 */
export interface ProductFormProps {
  product?: ProductFull;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Estado del hook useProducts
 */
export interface ProductsState {
  products: ProductFull[];
  isLoading: boolean;
  filters: ProductFilters;
  totalProducts: number;
}

/**
 * Resultado del hook useProducts
 */
export interface UseProductsResult extends ProductsState {
  fetchProducts: (filterParams?: ProductFilters) => Promise<ProductFull[]>;
  fetchProductById: (id: string) => Promise<ProductFull>;
  createProduct: (data: CreateProductData) => Promise<ProductFull>;
  updateProduct: (productId: string, data: UpdateProductData) => Promise<ProductFull>;
  deleteProduct: (productId: string) => Promise<boolean>;
  applyFilters: (newFilters: ProductFilters) => Promise<ProductFull[]>;
  clearFilters: () => Promise<ProductFull[]>;
  searchProducts: (searchTerm: string) => Promise<ProductFull[]>;
  filterByStatus: (isActive: boolean | null) => Promise<ProductFull[]>;
  filterByCategory: (categoryId: string) => Promise<ProductFull[]>;
}

/**
 * Opciones para selectores de estado de producto
 */
export interface ProductStatusOption {
  value: boolean | null;
  label: string;
  count?: number;
}

/**
 * Estadísticas de productos
 */
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  withCategory: number;
  withoutCategory: number;
}

/**
 * Configuración de columnas para tablas de productos
 */
export interface ProductColumnConfig {
  key: keyof ProductFull | '_count';
  label: string;
  sortable?: boolean;
  visible?: boolean;
  width?: string;
}