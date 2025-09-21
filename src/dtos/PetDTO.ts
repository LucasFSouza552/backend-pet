export interface CreatePetDTO {
    name: string;
    type: string;
    image: Buffer[];
    account_id: string; 
    description?: string;
    age?: number;
}

export interface UpdatePetDTO {
    name?: string;
    type?: string;
    description?: string;
    age?: number;
    adopted?: boolean;
    account_id?: string; 
    image?: Buffer[]; 
}
