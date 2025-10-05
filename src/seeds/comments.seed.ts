import { Comment } from "../models/Comments"


export const seedComments = async () => {
    await Comment.deleteMany({});

    // Seeds
}