import IPost from "@models/post";
import { mapToDTO } from "@utils/Mapper";

const postDTOFields: (keyof IPost)[] = [
    "id",
    "title",
    "image",
    "likes",
    "commentsCount",
    "content",
    "account",
    "createdAt",
    "updatedAt",
];

const postMapper = (post: IPost) => mapToDTO<IPost, IPost>(post, postDTOFields);

export default postMapper;