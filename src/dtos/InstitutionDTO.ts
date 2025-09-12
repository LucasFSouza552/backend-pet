export interface UpdateInstitutionDTO {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
        street?: string;
        number?: string;
        complement?: string;
        city?: string;
        cep?: string;
        state?: string;
    };
}

export interface InstitutionDTO {
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        city: string;
        cep: string;
        state: string;
    };
}
