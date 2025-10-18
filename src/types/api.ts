export type Company = {
    id: string
    name: string
    rut: string
    logoUrl: string | null
    address: string | null
    phone: string | null
    contactEmail: string | null
    createdAt: Date
    updatedAt: Date | null
    deletedAt: Date | null
}

export type CompanyResponse = Omit<Company, 'deletedAt' | 'updatedAt'>