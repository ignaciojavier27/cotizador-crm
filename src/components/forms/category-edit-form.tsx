'use client'

import { useCategories } from "@/hooks/useCategories";
import { UpdateCategoryInput, updateCategorySchema } from "@/lib/validations/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ClientOnly from "../ClientOnly";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Save } from "lucide-react";


export default function EditCategoryForm(
    { categoryId, currentUser }: {
        categoryId: string;
        currentUser: { 
            id: string;
            role: string;
            companyId: string;
        };
    }
) {
    const router = useRouter();
    const { fetchCategoryById, updateCategory, isLoading } = useCategories();

    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdateCategoryInput>({
        resolver: zodResolver(updateCategorySchema),
        defaultValues: {
            name: '',
            description: '',
        }
    })
    
    
    
    useEffect(() => {
        async function loadCategory() {
            
            try {

                const categoryData = await fetchCategoryById(categoryId);
                reset({
                    name: categoryData.name,
                    description: categoryData.description,
                });
                
            } catch {
                toast.error('Error al cargar la categoría:', {
                    description: 'Redirigiendo al dashboard...',
                });

                router.push('/dashboard/categories');
            }
        }

        loadCategory();
    }, [categoryId, fetchCategoryById, reset, router]);
    
    const onSubmit = async(data: UpdateCategoryInput) => {
        try {
            await updateCategory(categoryId, data);
            toast.success('Categoría actualizada correctamente', {
                description: 'Redirigiendo al dashboard...',
            });
            router.push('/dashboard/categories');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
            toast.error(errorMessage);
        }
    }
    
    if(currentUser.role !== 'admin') return null;
    
    return (
    <ClientOnly>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Datos de la categoría</h3>
            <div className="grid gap-4">
                <div className="space-y-1 my-2">
                    <Label>
                        Nombre:
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
            {/* Botones */}
            <div className="flex justify-end gap-4 pt-4">
            <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/categories')}
                disabled={isLoading}
            >
                Cancelar
            </Button>
            <Button 
                className="cursor-pointer"
                type="submit" 
                disabled={isLoading}
            >
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
    )    

}