'use client';

import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { CreateProductInput, createProductSchema } from "@/lib/validations/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ClientOnly from "../ClientOnly";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function ProductCreateForm() {
  const router = useRouter();
  const { isLoading, createProduct } = useProducts();
  const { fetchCategories, categories } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "", 
      brand: "",
      basePrice: 0,
      taxPercentage: 0,
      categoryId: "",
      isActive: true,
    }
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onSubmit = async (data: CreateProductInput) => {
    try {
      const newProduct = await createProduct(data);

      toast.success(`Producto "${newProduct.name}" creado correctamente`, {
        description: "Redirigiendo al listado...",
      });

      reset();
      router.push(`/dashboard/products`);
    } catch (err) {
      let message = "Intenta nuevamente.";

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }

      toast.error("Error al crear producto", { description: message });
    }
  };

  return (
    <ClientOnly>
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
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
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
              placeholder="Ej: Laptop con procesador Ryzen 5, 8GB RAM y SSD de 512GB. Ideal para uso profesional y multitarea..."
              disabled={isLoading}
              {...register("description")}
              rows={4}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                errors.description ? "border-red-500" : ""
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
                {...register("type")}
                className={errors.type ? "border-red-500" : ""}
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
                {...register("brand")}
                className={errors.brand ? "border-red-500" : ""}
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
              <Label htmlFor="basePrice" className="text-sm font-medium">
                Precio Base (CLP) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  id="basePrice"
                  placeholder="499990"
                  disabled={isLoading}
                  {...register("basePrice", { 
                    valueAsNumber: true,
                  })}
                  className={`pl-7 ${errors.basePrice ? "border-red-500" : ""}`}
                />
              </div>
              {errors.basePrice && (
                <p className="text-sm text-red-500">{errors.basePrice.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Precio sin impuestos
              </p>
            </div>

            {/* Porcentaje de Impuesto */}
            <div className="space-y-2">
              <Label htmlFor="taxPercentage" className="text-sm font-medium">
                Impuesto (%) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  id="taxPercentage"
                  placeholder="19"
                  disabled={isLoading}
                  {...register("taxPercentage", { 
                    valueAsNumber: true,
                  })}
                  className={`pr-8 ${errors.taxPercentage ? "border-red-500" : ""}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {errors.taxPercentage && (
                <p className="text-sm text-red-500">
                  {errors.taxPercentage.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                IVA u otros impuestos aplicables (usa 0 si no aplica)
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
              Categoría <span className="text-red-500">*</span>
            </Label>
            <select
              id="categoryId"
              disabled={isLoading}
              {...register("categoryId")}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.categoryId ? "border-red-500" : ""
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
          <div className="flex items-start space-x-3 rounded-lg border p-4 bg-gray-50">
            <input
              type="checkbox"
              id="isActive"
              disabled={isLoading}
              {...register("isActive")}
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <Label 
                htmlFor="isActive" 
                className="text-sm font-medium text-slate-900 cursor-pointer"
              >
                Producto activo
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Solo los productos activos estarán disponibles para cotizaciones
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/products')}
            disabled={isLoading}
            className="flex-1 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando producto...
              </>
            ) : (
              "Crear producto"
            )}
          </Button>
        </div>
      </form>
    </ClientOnly>
  );
}