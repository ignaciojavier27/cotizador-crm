import { requireAuth } from '@/lib/auth/authorize';
import { getAllTaxes } from '@/lib/services/taxServices';
import { redirect } from 'next/navigation';
import TaxesClient from '@/components/taxes/TaxesClient';
import { TaxFull } from '@/types/tax';

export const metadata = {
    title: 'Impuestos | Dashboard',
    description: 'Gestiona los impuestos para tus productos',
};

interface TaxesPageResult {
    taxes: TaxFull[];
    total: number;
}

async function getTaxesData(companyId: string): Promise<{
    taxes: TaxFull[];
    total: number;
}> {
    try {
        const result = await getAllTaxes({
            companyId,
            isActive: null,
            search: null,
        });

        return {
            taxes: result.taxes,
            total: result.total,
        };
    } catch (error) {
        console.error('Error al cargar impuestos:', error);
        return {
            taxes: [],
            total: 0,
        };
    }
}

export default async function TaxesPage() {
    let user;

    try {
        user = await requireAuth();

        if (!user?.companyId) {
            redirect('/dashboard');
        }

        const { taxes, total } = await getTaxesData(user.companyId);

        return (
            <TaxesClient
                initialTaxes={taxes}
                totalTaxes={total}
            />
        );
    } catch (error) {
        console.error('Error crítico en TaxesPage:', error);

        if (error instanceof Error && error.message.includes('auth')) {
            redirect('/login');
        }

        return (
            <TaxesClient
                initialTaxes={[]}
                totalTaxes={0}
            />
        );
    }
}
