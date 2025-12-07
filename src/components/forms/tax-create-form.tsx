'use client';

import { useTaxes } from "@/hooks/useTaxes";
import { CreateTaxInput, createTaxSchema } from "@/lib/validations/tax";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ClientOnly from "../ClientOnly";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export function TaxCreateForm() {
    const router = useRouter();
    const { isLoading, createTax } = useTaxes();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateTaxInput>({
        resolver: zodResolver(createTaxSchema),
        defaultValues: {
            name: "",
            percentage: 0,
            description: "",
            isActive: true,
        }
    });

    const onSubmit = async (data: CreateTaxInput) => {
        try {
            const newTax = await createTax(data);

            toast.success(`Impuesto "${newTax.name}" creado correctamente`, {
                description: "Redirigiendo al listado...",
            });

            reset();
            router.push(`/dashboard/taxes`);
        } catch (err) {
            let message = "Intenta nuevamente.";

            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === "string") {
                message = err;
            }

            toast.error("Error al crear impuesto", { description: message });
        }
    };

    return (
        <ClientOnly>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                        Información del Impuesto
                    </h3>

                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Nombre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Ej: IVA, Impuesto Adicional"
                            disabled={isLoading}
                            {...register("name")}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Porcentaje */}
                    <div className="space-y-2">
                        <Label htmlFor="percentage" className="text-sm font-medium">
                            Porcentaje (%) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                id="percentage"
                                placeholder="19.00"
                                disabled={isLoading}
                                {...register("percentage", {
                                    valueAsNumber: true,
                                })}
                                className={`pr-8 ${errors.percentage ? "border-red-500" : ""}`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                %
                            </span>
                        </div>
                        {errors.percentage && (
                            <p className="text-sm text-red-500">
                                {errors.percentage.message}
                            </p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Descripción
                        </Label>
                        <textarea
                            id="description"
                            placeholder="Descripción opcional del impuesto..."
                            disabled={isLoading}
                            {...register("description")}
                            rows={3}
                            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${errors.description ? "border-red-500" : ""
                                }`}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">
                                {errors.description.message}
                            </p>
                        )}
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
                                Impuesto activo
                            </Label>
                            <p className="text-xs text-gray-600 mt-1">
                                Si se desactiva, no podrá ser seleccionado para nuevos productos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/taxes')}
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
                                Creando...
                            </>
                        ) : (
                            "Crear impuesto"
                        )}
                    </Button>
                </div>
            </form>
        </ClientOnly>
    );
}
