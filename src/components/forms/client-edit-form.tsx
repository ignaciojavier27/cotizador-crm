'use client';

import { useClients } from "@/hooks/useClients";
import { UpdateClientInput, updateClientSchema } from "@/lib/validations/clients";
import { ClientWithCompany } from "@/types/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ClientOnly from "../ClientOnly";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { useState } from "react";

export default function ClientEditForm(
    { client }: { client: ClientWithCompany }
) {
    const router = useRouter();
    const { updateClient } = useClients();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<UpdateClientInput>({
        resolver: zodResolver(updateClientSchema),
        defaultValues: {
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            clientCompany: client.clientCompany || '',
            referenceContact: client.referenceContact || '',
            dataConsent: client.dataConsent || false,
        }
    })

    const onSubmit = async(data: UpdateClientInput) => {
        setIsLoading(true);
        try {
            const updatedClient = await updateClient(client.id, data);

            toast.success(`Cliente "${updatedClient.name}" actualizado correctamente`, {
                description: "Redirigiendo al listado...",
            });

            router.push(`/dashboard/clients`);
        } catch (err) {
            const errorMessage = err instanceof Error 
                ? err.message 
                : 'Error al actualizar cliente';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ClientOnly>
            <div className="container mx-auto p-6 pt-6 md:p-10">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard/clients')}
                        className="mb-4 -ml-2 cursor-pointer"
                        disabled={isLoading}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a clientes
                    </Button>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Editar Cliente</h1>
                            <p className="text-gray-600 mt-1">Actualiza la información de {client.name}</p>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-lg shadow p-6 md:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Información básica del cliente */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                                Información del Cliente
                            </h3>

                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Nombre del Cliente <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Juan Pérez"
                                    disabled={isLoading}
                                    {...register("name")}
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Email y Teléfono en Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Ej: juan.perez@ejemplo.com"
                                        disabled={isLoading}
                                        {...register("email")}
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">
                                        Teléfono <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="Ej: +56 9 1234 5678"
                                        disabled={isLoading}
                                        {...register("phone")}
                                        className={errors.phone ? "border-red-500" : ""}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Información de la empresa */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                                Información de la Empresa
                            </h3>

                            {/* Empresa del Cliente */}
                            <div className="space-y-2">
                                <Label htmlFor="clientCompany" className="text-sm font-medium">
                                    Empresa <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="clientCompany"
                                    placeholder="Ej: Tech Solutions SpA"
                                    disabled={isLoading}
                                    {...register("clientCompany")}
                                    className={errors.clientCompany ? "border-red-500" : ""}
                                />
                                {errors.clientCompany && (
                                    <p className="text-sm text-red-500">{errors.clientCompany.message}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Nombre de la empresa donde trabaja el cliente
                                </p>
                            </div>

                            {/* Contacto de Referencia */}
                            <div className="space-y-2">
                                <Label htmlFor="referenceContact" className="text-sm font-medium">
                                    Contacto de Referencia <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="referenceContact"
                                    placeholder="Ej: María González - Gerente de Compras"
                                    disabled={isLoading}
                                    {...register("referenceContact")}
                                    className={errors.referenceContact ? "border-red-500" : ""}
                                />
                                {errors.referenceContact && (
                                    <p className="text-sm text-red-500">{errors.referenceContact.message}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Persona de contacto alternativa o información adicional
                                </p>
                            </div>
                        </div>

                        {/* Consentimiento de datos */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                                Protección de Datos
                            </h3>

                            {/* Consentimiento */}
                            <div className="flex items-start space-x-3 rounded-lg border p-4 bg-gray-50">
                                <input
                                    type="checkbox"
                                    id="dataConsent"
                                    disabled={isLoading}
                                    {...register("dataConsent")}
                                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <Label 
                                        htmlFor="dataConsent" 
                                        className="text-sm font-medium text-slate-900 cursor-pointer"
                                    >
                                        Consentimiento para el uso de datos
                                    </Label>
                                    <p className="text-xs text-gray-600 mt-1">
                                        El cliente autoriza el uso de sus datos personales para fines comerciales y de contacto
                                    </p>
                                </div>
                            </div>
                            {errors.dataConsent && (
                                <p className="text-sm text-red-500">{errors.dataConsent.message}</p>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/clients')}
                                disabled={isLoading}
                                className="flex-1 cursor-pointer"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 cursor-pointer"
                                disabled={isLoading || !isDirty}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Actualizando cliente...
                                    </>
                                ) : (
                                    "Guardar cambios"
                                )}
                            </Button>
                        </div>

                        {/* Mensaje de cambios pendientes */}
                        {isDirty && (
                            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="font-medium">Tienes cambios sin guardar</p>
                                <p className="text-xs mt-1">Asegúrate de guardar los cambios antes de salir</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </ClientOnly>
    )
}