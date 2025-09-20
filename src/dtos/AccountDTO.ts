export interface updateAccountDTO {
    name?: string;
    password?: string;
    address?: {
        street?: string;
        number?: string;
        complement?: string;
        city?: string;
        cep?: string;
        state?: string;
    };
}

export interface createAccountDTO {
    name: string;
    email: string;
    password: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        city: string;
        cep: string;
        state: string;
    };
}

export interface AccountDTO {
    name: string;
    email: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        city: string;
        cep: string;
        state: string;
    };
}
