import { getCompany } from "@/actions/company";
import { CompanyForm } from "@/components/company/CompanyForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function CompanyEditPage() {
    const result = await getCompany();

    if (!result.success || !result.data) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {result.error || "No se pudo cargar la información de la empresa."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-12">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Editar Empresa</h2>
            </div>
            <div className="space-y-4">
                <CompanyForm initialData={result.data} />
            </div>
        </div>
    );
}
