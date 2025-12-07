export interface TaxBase {
    id: string;
    name: string;
    percentage: number;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string | null;
}

export interface TaxFull extends TaxBase {
    companyId: string;
}

export interface TaxFilters {
    search?: string;
    isActive?: boolean | null;
}

export interface TaxQueryParams {
    companyId: string;
    isActive?: string | null;
    search?: string | null;
}

export interface CreateTaxData {
    name: string;
    percentage: number;
    description?: string;
    isActive?: boolean;
}

export interface UpdateTaxData {
    name?: string;
    percentage?: number;
    description?: string;
    isActive?: boolean;
}

export interface TaxFormData {
    name: string;
    percentage: number;
    description?: string;
    isActive: boolean;
}
