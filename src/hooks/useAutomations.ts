import { useState, useCallback, useEffect } from "react";
import { AutomationWithStats } from "@/types/automation";
import { notify } from "@/utils/notifications";

export function useAutomations() {
    const [automations, setAutomations] = useState<AutomationWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAutomations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/automations");
            if (!response.ok) {
                throw new Error("Error al cargar automatizaciones");
            }
            const data = await response.json();
            setAutomations(data);
        } catch (err) {
            console.error("Error fetching automations:", err);
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createAutomation = async (data: any) => {
        try {
            const response = await fetch("/api/automations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al crear automatización");
            }

            await fetchAutomations();
            notify.success("Automatización creada correctamente");
            return true;
        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Error al crear");
            return false;
        }
    };

    const updateAutomation = async (id: string, data: any) => {
        try {
            const response = await fetch(`/api/automations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al actualizar automatización");
            }

            await fetchAutomations();
            notify.success("Automatización actualizada correctamente");
            return true;
        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Error al actualizar");
            return false;
        }
    };

    const deleteAutomation = async (id: string) => {
        try {
            const response = await fetch(`/api/automations/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al eliminar automatización");
            }

            await fetchAutomations();
            notify.success("Automatización eliminada correctamente");
            return true;
        } catch (err) {
            notify.error(err instanceof Error ? err.message : "Error al eliminar");
            return false;
        }
    };

    const toggleAutomationStatus = async (id: string, currentStatus: boolean) => {
        return updateAutomation(id, { isActive: !currentStatus });
    };

    useEffect(() => {
        fetchAutomations();
    }, [fetchAutomations]);

    return {
        automations,
        isLoading,
        error,
        createAutomation,
        updateAutomation,
        deleteAutomation,
        toggleAutomationStatus,
        refresh: fetchAutomations,
    };
}
