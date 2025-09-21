export interface CreateAchievementDTO {
    name: string;
    description: string;
    type: "donation" | "sponsorship" | "adoption";
}

export interface UpdateAchievementDTO {
    name?: string;
    description?: string;
    type?: "donation" | "sponsorship" | "adoption";
}

export interface AchievementDTO {
    id: string;
    name: string;
    description: string;
    type: "donation" | "sponsorship" | "adoption";
}


