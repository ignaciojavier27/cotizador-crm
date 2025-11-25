"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";


import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { createQuotationSchema } from "@/lib/validations/quotation";
import { createQuotationWithData } from "@/lib/actions/quotations";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

type Client = {
    id: string;
    name: string;
    email: string | null;
    rut?: string;
};

type Product = {
    id: string;
    name: string;
    basePrice: number;
    taxPercentage: number;
    brand: string;
    type: string;
};

interface CreateQuotationFormProps {
    clients: Client[];
    products: Product[];
}

type FormValues = z.infer<typeof createQuotationSchema>;

export default function CreateQuotationForm({
    clients,
    products,
}: CreateQuotationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(createQuotationSchema),
        defaultValues: {
            details: [
                {
                    productId: "",
                    quantity: 1,
                    unitPrice: 0,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "details",
    });

    // Calculate totals
    const details = form.watch("details");

    const totals = details.reduce(
        (acc, detail) => {
            const quantity = detail.quantity || 0;
            const price = detail.unitPrice || 0;
            const subtotal = quantity * price;

            // Find product to get tax rate
            const product = products.find(p => p.id === detail.productId);
            const taxRate = product ? (product.taxPercentage / 100) : 0.19; // Default to 19% if not found
            const tax = subtotal * taxRate;

            return {
                subtotal: acc.subtotal + subtotal,
                tax: acc.tax + tax,
                total: acc.total + subtotal + tax,
            };
        },
        { subtotal: 0, tax: 0, total: 0 }
    );

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
        try {
            const result = await createQuotationWithData(data);

            if (!result?.success) {
                toast.error(result?.error || "Error al crear la cotización");
                return;
            }

            toast.success("Cotización creada exitosamente");
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error inesperado");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            form.setValue(`details.${index}.productId`, productId);
            form.setValue(`details.${index}.unitPrice`, product.basePrice);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Client & Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Cliente</CardTitle>
                                <CardDescription>
                                    Seleccione el cliente para la cotización
                                </CardDescription>
                                <Button
                                    onClick={() => router.push("/dashboard/clients/create")}
                                    className="cursor-pointer"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Cliente
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="clientId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cliente</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar cliente" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {clients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id}>
                                                            {client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="expiresAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Expiración</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value ? field.value.split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Opcional. Por defecto 7 días.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="internalNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notas Internas</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Notas visibles solo para el equipo..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Products */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Productos</CardTitle>
                                    <CardDescription>
                                        Agregue los productos a cotizar
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        append({ productId: "", quantity: 1, unitPrice: 0 })
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Producto
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="flex flex-col sm:flex-row gap-4 items-start sm:items-end border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <FormField
                                            control={form.control}
                                            name={`details.${index}.productId`}
                                            render={({ field: productField }) => (
                                                <FormItem className="flex-1 w-full sm:w-auto">
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                                        Producto
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={(value) => handleProductChange(index, value)}
                                                        defaultValue={productField.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar producto" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {products.map((product) => (
                                                                <SelectItem key={product.id} value={product.id}>
                                                                    {product.name} - {new Intl.NumberFormat("es-CL", {
                                                                        style: "currency",
                                                                        currency: "CLP",
                                                                    }).format(product.basePrice)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`details.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                                        Cant.
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseInt(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`details.${index}.unitPrice`}
                                            render={({ field }) => (
                                                <FormItem className="w-32">
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                                        Precio Unit.
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseFloat(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="w-32 pb-2 text-right text-sm">
                                            <span className="block text-muted-foreground text-xs">Subtotal</span>
                                            {new Intl.NumberFormat("es-CL", {
                                                style: "currency",
                                                currency: "CLP",
                                            }).format(
                                                (form.watch(`details.${index}.quantity`) || 0) *
                                                (form.watch(`details.${index}.unitPrice`) || 0)
                                            )}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mb-0.5"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="flex flex-col items-end border-t pt-6 gap-2">
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-muted-foreground">Subtotal Neto:</span>
                                    <span>
                                        {new Intl.NumberFormat("es-CL", {
                                            style: "currency",
                                            currency: "CLP",
                                        }).format(totals.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-muted-foreground">IVA (Aprox):</span>
                                    <span>
                                        {new Intl.NumberFormat("es-CL", {
                                            style: "currency",
                                            currency: "CLP",
                                        }).format(totals.tax)}
                                    </span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs font-bold text-lg mt-2">
                                    <span>Total:</span>
                                    <span>
                                        {new Intl.NumberFormat("es-CL", {
                                            style: "currency",
                                            currency: "CLP",
                                        }).format(totals.total)}
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Cotización
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
