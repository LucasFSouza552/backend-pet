import IComment from "../models/Comments";
import { mapToDTO } from "../utils/Mapper";

const commentDTOFields: (keyof IComment)[] = [
    'id',
    'postId',
    'author',
    'content',
    'createdAt',
    'updatedAt'
];

const commentMapper = (comment: IComment) => mapToDTO<IComment, IComment>(comment, commentDTOFields);

export default commentMapper;