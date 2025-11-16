import AccountRepository from "./account.repository";
import AccountPetInteractionRepository from "./accountPetInteraction.repository";
import AchievementRepository from "./achievement.repository";
import AuthRepository from "./auth.repository";
import CommentRepository from "./comment.repository";
import HistoryRepository from "./history.repository";
import PetRepository from "./pet.repository";
import PostRepository from "./post.repository";
import AccountAchievementRepository from "./accountAchievement.repository";
import NotificationRepository from "./notification.repository";


export const accountRepository = new AccountRepository();
export const accountPetInteractionRepository = new AccountPetInteractionRepository();
export const achievementRepository = new AchievementRepository();
export const authRepository = new AuthRepository();
export const commentRepository = new CommentRepository();
export const historyRepository = new HistoryRepository();
export const petRepository = new PetRepository();
export const postRepository = new PostRepository();
export const accountAchievementRepository = new AccountAchievementRepository();
export const notificationRepository = new NotificationRepository();
