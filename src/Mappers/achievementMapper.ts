import { AchievementDTO } from "@dtos/achievementDTO";
import { IAchievement } from "@models/achievements";
import { mapToDTO } from "@utils/Mapper";

const achievementDTOFields: (keyof AchievementDTO)[] = [
    "id",
    "name",
    "description",
    "type"
];

const achievementMapper = (account: IAchievement) => mapToDTO<IAchievement, AchievementDTO>(account, achievementDTOFields);

export default achievementMapper;