export interface updateUserDTO {
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

export interface UserDTO {
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
