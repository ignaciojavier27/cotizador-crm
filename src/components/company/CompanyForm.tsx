'use client'

import { updateCompany } from "@/actions/company";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatedCompanySchema } from "@/lib/validations/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type CompanyFormProps = {
    initialData: {
        id: string;
        name: string;
        rut: string;
        logoUrl: string | null;
        address: string | null;
        phone: string | null;
        contactEmail: string | null;
    }
}

type FormData = z.infer<typeof updatedCompanySchema>;

export function CompanyForm({ initialData }: CompanyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(updatedCompanySchema),
        defaultValues: {
            name: initialData.name,
            rut: initialData.rut,
            logoUrl: initialData.logoUrl,
            address: initialData.address,
            phone: initialData.phone,
            contactEmail: initialData.contactEmail,
        }
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const result = await updateCompany(data);

            if (result.success) {
                toast.success("Empresa actualizada correctamente");
                router.push("/dashboard/companies");
                router.refresh();
            } else {
                toast.error(result.error || "Error al actualizar la empresa");
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>
                    Actualiza los datos de tu empresa. Estos datos serán visibles en las cotizaciones.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la Empresa</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder="Ej: Mi Empresa SpA"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rut">RUT</Label>
                            <Input
                                id="rut"
                                {...register("rut")}
                                placeholder="Ej: 76.123.456-7"
                            />
                            {errors.rut && (
                                <p className="text-sm text-red-500">{errors.rut.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email de Contacto</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                {...register("contactEmail")}
                                placeholder="contacto@empresa.com"
                            />
                            {errors.contactEmail && (
                                <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                {...register("phone")}
                                placeholder="+56 9 1234 5678"
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">{errors.phone.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                {...register("address")}
                                placeholder="Av. Principal 123, Ciudad"
                            />
                            {errors.address && (
                                <p className="text-sm text-red-500">{errors.address.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="logoUrl">URL del Logo</Label>
                            <Input
                                id="logoUrl"
                                {...register("logoUrl")}
                                placeholder="https://ejemplo.com/logo.png"
                            />
                            {errors.logoUrl && (
                                <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Ingresa la URL de la imagen de tu logo.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button className="cursor-pointer" type="button" variant="outline" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
