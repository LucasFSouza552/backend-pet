import { CommentsWithAuthors } from "@dtos/commentDTO";

export function mapCommentsWithAuthor(comment: CommentsWithAuthors) {
    try {

        return {
            ...comment,
            id: comment._id,
            account: {
                ...comment.account,
                id: comment.account._id
            }
        }
    }catch(error) {
        throw error;
    }
}