'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ClientOnly from '../ClientOnly';
import { UpdateProductInput, updateProductSchema } from '@/lib/validations/products';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import ProductFormSkeleton from '../skeletons/ProductFormSkeleton';

interface ProductEditFormProps {
  productId: string;
  currentUserCompanyId: string;
}

export default function ProductEditForm({ 
  productId, 
  currentUserCompanyId 
}: ProductEditFormProps) {
  const router = useRouter();
  const { fetchProductById, updateProduct, isLoading } = useProducts();
  const { fetchCategories, categories } = useCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: '',
      description: '',
      type: '',
      brand: '',
      base_price: 0,
      tax_percentage: 0,
      categoryId: '',
      isActive: true,
    }
  });

  const isActive = watch('isActive');

  // Cargar categorías
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Cargar datos del producto
  useEffect(() => {
    async function loadProduct() {
      try {
        const productData = await fetchProductById(productId);
        
        // Validar que el producto pertenezca a la empresa del usuario
        if (productData.companyId !== currentUserCompanyId) {
          toast.error('No tienes permisos para editar este producto', {
            description: 'Redirigiendo al dashboard...',
          });
          router.push('/dashboard/products');
          return;
        }

        reset({
          name: productData.name,
          description: productData.description || '',
          type: productData.type || '',
          brand: productData.brand || '',
          base_price: productData.basePrice,
          tax_percentage: productData.taxPercentage,
          categoryId: productData.category?.id ? String(productData.category.id) : '',
          isActive: productData.isActive,
        });
      } catch {
        toast.error('Error al cargar producto', {
          description: 'Redirigiendo al dashboard...',
        });
        router.push('/dashboard/products');
      }
    }

    loadProduct();
  }, [productId, fetchProductById, currentUserCompanyId, router, reset]);

  const onSubmit = async (data: UpdateProductInput) => {
    try {
      await updateProduct(productId, data);
      
      toast.success('Producto actualizado correctamente', {
        description: 'Redirigiendo al dashboard...',
      });
      
      router.push('/dashboard/products');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al actualizar producto';
      toast.error(errorMessage);
    }
  };

  return (
    <ClientOnly
      fallback={
        <ProductFormSkeleton />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            Información del Producto
          </h3>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre del Producto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Notebook Lenovo IdeaPad 3"
              disabled={isLoading}
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <textarea
              id="description"
              placeholder="Ej: Laptop con procesador Ryzen 5, 8GB RAM y SSD de 512GB..."
              disabled={isLoading}
              {...register('description')}
              rows={4}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Describe las características principales del producto
            </p>
          </div>

          {/* Tipo y Marca en Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Tipo
              </Label>
              <Input
                id="type"
                placeholder="Ej: Electrónica, Servicio, Software"
                disabled={isLoading}
                {...register('type')}
                className={errors.type ? 'border-red-500' : ''}
              />
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium">
                Marca
              </Label>
              <Input
                id="brand"
                placeholder="Ej: Lenovo, Samsung, HP"
                disabled={isLoading}
                {...register('brand')}
                className={errors.brand ? 'border-red-500' : ''}
              />
              {errors.brand && (
                <p className="text-sm text-red-500">{errors.brand.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información de Precios */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            Precios e Impuestos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Precio Base */}
            <div className="space-y-2">
              <Label htmlFor="base_price" className="text-sm font-medium">
                Precio Base (CLP)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  id="base_price"
                  placeholder="499990"
                  disabled={isLoading}
                  {...register('base_price', { 
                    valueAsNumber: true,
                  })}
                  className={`pl-7 ${errors.base_price ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.base_price && (
                <p className="text-sm text-red-500">{errors.base_price.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Precio sin impuestos
              </p>
            </div>

            {/* Porcentaje de Impuesto */}
            <div className="space-y-2">
              <Label htmlFor="tax_percentage" className="text-sm font-medium">
                Impuesto (%)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  id="tax_percentage"
                  placeholder="19"
                  disabled={isLoading}
                  {...register('tax_percentage', { 
                    valueAsNumber: true,
                  })}
                  className={`pr-8 ${errors.tax_percentage ? 'border-red-500' : ''}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {errors.tax_percentage && (
                <p className="text-sm text-red-500">
                  {errors.tax_percentage.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                IVA u otros impuestos aplicables
              </p>
            </div>
          </div>
        </div>

        {/* Categorización */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            Categorización
          </h3>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-sm font-medium">
              Categoría
            </Label>
            <select
              id="categoryId"
              disabled={isLoading}
              {...register('categoryId')}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.categoryId ? 'border-red-500' : ''
              }`}
            >
              <option value="">Selecciona una categoría</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}> 
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-red-500">
                {errors.categoryId.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Ayuda a organizar y filtrar tus productos
            </p>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base">
                Producto activo
              </Label>
              <p className="text-sm text-gray-500">
                {isActive 
                  ? 'El producto está disponible para cotizaciones' 
                  : 'El producto no está disponible para cotizaciones'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/products')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </ClientOnly>
  );
}