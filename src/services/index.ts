import AccountService from "./Account.services";
import AccountPetInteractionService from "./AccountPetInteraction.services";
import AchievementService from "./Achievement.services";
import AuthService from "./Auth.services";
import CommentService from "./Comment.services";
import HistoryService from "./History.services";
import PetService from "./Pet.services";
import PostService from "./Post.services";

export const accountService = new AccountService();
export const accountPetInteractionService = new AccountPetInteractionService();
export const achievementService = new AchievementService();
export const authService = new AuthService();
export const commentService = new CommentService();
export const historyService = new HistoryService();
export const petService = new PetService();
export const postService = new PostService();