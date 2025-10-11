
import { AchievementDTO } from "../dtos/AchievementDTO";
import { IAchievement } from "../models/Achievements";
import { mapToDTO } from "../utils/Mapper";

const achievementDTOFields: (keyof AchievementDTO)[] = [
    "id",
    "name",
    "description",
    "type"
];

const achievementMapper = (account: IAchievement) => mapToDTO<IAchievement, AchievementDTO>(account, achievementDTOFields);

export default achievementMapper;