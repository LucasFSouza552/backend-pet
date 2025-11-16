import AccountService from "./account.services";
import AccountPetInteractionService from "./accountPetInteraction.services";
import AchievementService from "./achievement.services";
import AuthService from "./auth.services";
import CommentService from "./comment.services";
import HistoryService from "./history.services";
import NotificationService from "./notification.services";
import PetService from "./pet.services";
import PostService from "./post.services";

export const accountService = new AccountService();
export const accountPetInteractionService = new AccountPetInteractionService();
export const achievementService = new AchievementService();
export const authService = new AuthService();
export const commentService = new CommentService();
export const historyService = new HistoryService();
export const petService = new PetService();
export const postService = new PostService();
export const notificationService = new NotificationService();