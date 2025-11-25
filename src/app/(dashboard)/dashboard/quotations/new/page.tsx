import { requireAuth } from "@/lib/auth/authorize";
import { getAllClients } from "@/lib/services/clientServices";
import { getActiveProducts } from "@/lib/services/productServices";
import CreateQuotationForm from "@/components/quotations/CreateQuotationForm";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Nueva Cotización | Dashboard",
    description: "Crear una nueva cotización",
};

export default async function NewQuotationPage() {
    const user = await requireAuth();

    if (!user?.companyId) {
        redirect("/dashboard");
    }

    const [clientsData, products] = await Promise.all([
        getAllClients({ companyId: user.companyId }),
        getActiveProducts(user.companyId),
    ]);

    return (
        <div className="space-y-6 p-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nueva Cotización</h1>
                <p className="text-muted-foreground">
                    Complete el formulario para crear una nueva cotización.
                </p>
            </div>

            <CreateQuotationForm
                clients={clientsData.clients}
                products={products}
            />
        </div>
    );
}
