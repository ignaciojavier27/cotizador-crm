"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAutomations } from "@/hooks/useAutomations";
import { AutomationList } from "./AutomationList";
import { AutomationForm } from "./AutomationForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AutomationFormData } from "@/lib/validations/automation";
import { AutomationWithStats } from "@/types/automation";

export default function AutomationsClient() {
    const { data: session } = useSession();
    const {
        automations,
        isLoading,
        createAutomation,
        updateAutomation,
        deleteAutomation,
        toggleAutomationStatus,
    } = useAutomations();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState<
        AutomationWithStats | undefined
    >(undefined);

    const isAdmin = session?.user?.role === "admin";

    const handleCreate = () => {
        setEditingAutomation(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (automation: AutomationWithStats) => {
        setEditingAutomation(automation);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: AutomationFormData) => {
        if (editingAutomation) {
            await updateAutomation(editingAutomation.id, data);
        } else {
            await createAutomation(data);
        }
    };

    const getInitialData = () => {
        if (!editingAutomation) return undefined;
        return {
            ...editingAutomation,
            daysWait: editingAutomation.daysWait ?? 0,
            emailSubject: editingAutomation.emailSubject ?? "",
            emailContent: editingAutomation.emailContent ?? "",
        };
    };

    return (
        <div className="container mx-auto p-6 pt-6 md:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Automatizaciones</h1>
                    <p className="text-gray-600 mt-1">
                        Gestiona el envío automático de recordatorios y promociones
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={handleCreate} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Automatización
                    </Button>
                )}
            </div>

            <AutomationList
                automations={automations}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={deleteAutomation}
                onToggleStatus={toggleAutomationStatus}
            />

            <AutomationForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={getInitialData()}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
