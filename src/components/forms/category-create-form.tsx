'use client'

import { useCategories } from "@/hooks/useCategories";
import { CreateCategoryInput, createCategorySchema } from "@/lib/validations/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ClientOnly from "../ClientOnly";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export function CategoryCreateForm() {
    const router = useRouter();
    const { isLoading, createCategory } = useCategories();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateCategoryInput>({
        resolver: zodResolver(createCategorySchema),
    });

    const onSubmit = async (data: CreateCategoryInput) => {
        try {
            const category = await createCategory(data);

            toast.success(`Categoría ${category.name} creada correctamente`, {
                description: `Redirigiendo al dashboard...`
            });

            reset();
            router.push(`/dashboard/categories`);
        } catch (err) {
            let message = "Intenta nuevamente.";

            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === "string") {
                message = err;
            }

            toast.error("Error al crear categoría", { description: message });
        }
    };

    return (
        <ClientOnly>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Datos de la categoría
                    </h3>

                    {/* Nombre */}
                    <div className="space-y-1 my-2">
                        <Label>
                            Nombre: <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Ej: Tecnología"
                            disabled={isLoading}
                            {...register("name")}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Descripción (Textarea) */}
                    <div className="space-y-1 my-2">
                        <Label>Descripción:</Label>
                        <textarea
                            id="description"
                            placeholder="Ej: Categoría relacionada con productos tecnológicos..."
                            disabled={isLoading}
                            {...register("description")}
                            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] ${
                                errors.description ? "border-red-500" : ""
                            }`}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="mt-3 w-full cursor-pointer"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando categoría...
                        </>
                    ) : (
                        "Crear categoría"
                    )}
                </Button>
            </form>
        </ClientOnly>
    );
}
