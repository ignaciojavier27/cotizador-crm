"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Mail, Clock } from "lucide-react";
import { AutomationWithStats } from "@/types/automation";
import { AutomationType } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { confirmDelete } from "@/utils/confirmation";

interface AutomationListProps {
    automations: AutomationWithStats[];
    isLoading: boolean;
    onEdit: (automation: AutomationWithStats) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
}

const typeMap = {
    [AutomationType.reminder]: { label: "Recordatorio", color: "bg-blue-100 text-blue-800" },
    [AutomationType.promotion]: { label: "Promoción", color: "bg-purple-100 text-purple-800" },
};

export function AutomationList({
    automations,
    isLoading,
    onEdit,
    onDelete,
    onToggleStatus,
}: AutomationListProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (automations.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                <Mail className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No hay automatizaciones</h3>
                <p className="text-gray-500">Crea una nueva automatización para empezar.</p>
            </div>
        );
    }

    const handleDelete = async (id: string) => {
        if (await confirmDelete("esta automatización")) {
            onDelete(id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Asunto</TableHead>
                        <TableHead>Espera</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Creada</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {automations.map((automation) => (
                        <TableRow key={automation.id}>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={typeMap[automation.type].color}
                                >
                                    {typeMap[automation.type].label}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{automation.emailSubject}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{automation.daysWait} días</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={automation.isActive}
                                        onCheckedChange={() =>
                                            onToggleStatus(automation.id, automation.isActive)
                                        }
                                    />
                                    <span className="text-sm text-gray-500">
                                        {automation.isActive ? "Activa" : "Inactiva"}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-500">
                                {format(new Date(automation.createdAt), "dd MMM yyyy", {
                                    locale: es,
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => onEdit(automation)}
                                            className="cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(automation.id)}
                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
