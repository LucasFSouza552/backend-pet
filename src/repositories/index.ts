import AccountRepository from "./Account.repository";
import AccountPetInteractionRepository from "./AccountPetInteraction.repository";
import AchievementRepository from "./Achievement.repository";
import AuthRepository from "./Auth.repository";
import CommentRepository from "./Comment.repository";
import HistoryRepository from "./History.repository";
import PetRepository from "./Pet.repository";
import PostRepository from "./Post.repository";
import AccountAchievementRepository from "./AccountAchievement.repository";


export const accountRepository = new AccountRepository();
export const accountPetInteractionRepository = new AccountPetInteractionRepository();
export const achievementRepository = new AchievementRepository();
export const authRepository = new AuthRepository();
export const commentRepository = new CommentRepository();
export const historyRepository = new HistoryRepository();
export const petRepository = new PetRepository();
export const postRepository = new PostRepository();
export const accountAchievementRepository = new AccountAchievementRepository();
