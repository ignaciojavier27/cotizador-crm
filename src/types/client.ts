export interface ClientWithCompany {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    clientCompany: string | null;
    referenceContact: string | null;
    dataConsent: boolean;
    consentDate: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
    companyId: string;
    company: {
        id: string;
        name: string;
        rut: string | null;
    };
}


export interface ClientsPageResult {
    clients: ClientWithCompany[];
    total: number;
    filters: {
        search?: string;
        company: string;
    }
}

export interface ClientFilters {
    search?: string;
    companyId?: string;
}