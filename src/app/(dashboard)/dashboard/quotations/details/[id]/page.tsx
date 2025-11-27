
import QuotationDetails from "@/components/quotations/QuotationDetails";
import { getCurrentUser } from "@/lib/auth/session";
import { getQuotationById } from "@/lib/services/quotationServices";
import { redirect } from "next/navigation";

import { serializeDecimal } from "@/utils/serialization";

export default async function DetailsQuotationPage(
    { params }: { params: { id: string } }
) {
    const { id } = await params;

    const currentUser = await getCurrentUser();
    if (!currentUser) redirect("/login");

    const quotationResponse = await getQuotationById(id, currentUser.companyId);

    if (!quotationResponse) return new Response(null, { status: 404 });

    const serializedQuotation = serializeDecimal(quotationResponse);

    return (
        <QuotationDetails quotation={serializedQuotation} />
    );
}