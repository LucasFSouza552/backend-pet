import AccountController from "./account.controller";
import AccountPetInteractionController from "./accountPetInteraction.controller";
import AchievementController from "./achievement.controller";
import AuthController from "./auth.controller";
import CommentController from "./comment.controller";
import HistoryController from "./history.controller";
import NotificationController from "./notification.controller";
import PetController from "./pet.controller";
import PostController from "./post.controller";

export const accountController = new AccountController();
export const accountPetInteractionController = new AccountPetInteractionController();
export const achievementController = new AchievementController();
export const authController = new AuthController();
export const commentController = new CommentController();
export const historyController = new HistoryController();
export const petController = new PetController();
export const postController = new PostController();
export const notificationController = new NotificationController();