import AccountController from "./Account.controller";
import AccountPetInteractionController from "./AccountPetInteraction.controller";
import AchievementController from "./Achievement.controller";
import AuthController from "./Auth.controller";
import CommentController from "./Comment.controller";
import HistoryController from "./History.controller";
import NotificationController from "./Notification.controller";
import PetController from "./Pet.controller";
import PostController from "./Post.controller";

export const accountController = new AccountController();
export const accountPetInteractionController = new AccountPetInteractionController();
export const achievementController = new AchievementController();
export const authController = new AuthController();
export const commentController = new CommentController();
export const historyController = new HistoryController();
export const petController = new PetController();
export const postController = new PostController();
export const notificationController = new NotificationController();