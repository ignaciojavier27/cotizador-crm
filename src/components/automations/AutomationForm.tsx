"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { automationSchema, AutomationFormData } from "@/lib/validations/automation";
import { AutomationType } from "@prisma/client";

interface AutomationFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: AutomationFormData & { id?: string };
    onSubmit: (data: AutomationFormData) => Promise<void>;
}

export function AutomationForm({
    open,
    onOpenChange,
    initialData,
    onSubmit,
}: AutomationFormProps) {
    const form = useForm<AutomationFormData>({
        resolver: zodResolver(automationSchema) as any,
        defaultValues: {
            type: AutomationType.reminder,
            daysWait: 3,
            emailSubject: "",
            emailContent: "",
            isActive: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    type: initialData.type,
                    daysWait: initialData.daysWait,
                    emailSubject: initialData.emailSubject,
                    emailContent: initialData.emailContent,
                    isActive: initialData.isActive,
                });
            } else {
                form.reset({
                    type: AutomationType.reminder,
                    daysWait: 3,
                    emailSubject: "",
                    emailContent: "",
                    isActive: true,
                });
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = async (data: AutomationFormData) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Automatización" : "Nueva Automatización"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={AutomationType.reminder}>
                                                Recordatorio
                                            </SelectItem>
                                            <SelectItem value={AutomationType.promotion}>
                                                Promoción
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="daysWait"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Días de espera</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Días después de enviar la cotización
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="emailSubject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asunto del correo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Recordatorio de cotización..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="emailContent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contenido del correo</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Escriba el contenido del correo..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Activa</FormLabel>
                                        <FormDescription>
                                            La automatización se ejecutará si está activa
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {initialData ? "Guardar Cambios" : "Crear Automatización"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
