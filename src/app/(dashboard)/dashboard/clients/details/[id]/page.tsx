import ClientDetailsClient from "@/components/clients/ClientDetailsClient";
import { getCurrentUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/services/clientServices";

export default async function DetailsUserPage(
    { params }: { params: { id: string } }
) {
    const { id } = await params;
    
    const clientResponse = await getClientById(id);
    const currentUser = await getCurrentUser();

    if(!currentUser) return new Response(null, { status: 401 });

    if(currentUser.companyId !== clientResponse.companyId) return new Response(null, { status: 403 });

    if(!clientResponse) return new Response(null, { status: 404 });

    return (
        <ClientDetailsClient client={clientResponse}  />
    );
}