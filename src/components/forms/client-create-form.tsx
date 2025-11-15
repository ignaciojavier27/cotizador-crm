'use client';

import { useClients } from "@/hooks/useClients";
import { CreateClientInput, createClientSchema } from "@/lib/validations/clients";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ClientOnly from "../ClientOnly";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export function ClientCreateForm() {
    const router = useRouter();
    const { isLoading, createClient } = useClients();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateClientInput>({
        resolver: zodResolver(createClientSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            clientCompany: "",
            referenceContact: "",
            dataConsent: false,
        }
    })

    const onSubmit = async (data: CreateClientInput) => {
        try {
            const newClient = await createClient(data);

            toast.success(`Cliente "${newClient.name}" creado correctamente`, {
                description: "Redirigiendo al listado...",
            });

            reset();
            router.push(`/dashboard/clients`);
        } catch (err) {
            let message = "Intenta nuevamente.";

            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === "string") {
                message = err;
            }

            toast.error("Error al crear cliente", { description: message });
        }
    }

    return (
        <ClientOnly>
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
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creando cliente...
                            </>
                        ) : (
                            "Crear cliente"
                        )}
                    </Button>
                </div>
            </form>
        </ClientOnly>
    )
}