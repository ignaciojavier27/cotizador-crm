import ClientsClient from "@/components/clients/ClientsClient";
import { requireAuth } from "@/lib/auth/authorize";
import { getAllClients } from "@/lib/services/clientServices";
import { ClientsPageResult, ClientWithCompany } from "@/types/client";
import { redirect } from "next/navigation";


async function getClientsData(companyId: string): Promise<{
    clients: ClientWithCompany[];
    total: number;
}> {
    try {
        const result: ClientsPageResult = await getAllClients({ 
            companyId,
            search: null
        });
        return {
            clients: result.clients,
            total: result.total,
        };
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        return {
            clients: [],
            total: 0,
        };
    }
}

export default async function ClientsPage() {

    let user;

    try {
        user = await requireAuth();
    
        if (!user?.companyId) {
            console.warn('Usuario sin companyId, redirigiendo a dashboard');
            redirect('/dashboard');
        }

        const [clientsData] = await Promise.allSettled([
            getClientsData(user.companyId),
        ]);

        const clients = clientsData.status === 'fulfilled' ? clientsData.value.clients : [];
        const totalClients = clientsData.status === 'fulfilled' ? clientsData.value.total : 0;

        if (process.env.NODE_ENV === 'development') {
            console.log(`📦 Cargados ${clients.length} clientes de ${totalClients} totales`);
        }

        return (
            <ClientsClient
                initialClients={clients}
            />
        )
    } catch (error) {
        console.error('Error al cargar clientes:', error);

        if (error instanceof Error && error.message.includes('auth')) {
            redirect('/login');
        }

        return (
            <ClientsClient
                initialClients={[]}
            />
        )
    }


}