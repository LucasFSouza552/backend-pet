import { Account } from "@models/account";
import { Comment } from "@models/comments"
import { Post } from "@models/post";


export const seedComments = async () => {
    try {
        await Comment.deleteMany({});
        console.log("Comentários anteriores removidos");

        const posts = await Post.find({});
        const accounts = await Account.find({}).lean();

        if (posts.length === 0) throw new Error("Nenhum post encontrado.");
        if (accounts.length === 0) throw new Error("Nenhum usuário encontrado.");

        const exampleComments = [
            "Amei esse post!",
            "Meu pet também adora isso!",
            "Que foto linda!",
            "Esses momentos são os melhores!",
            "Muito inspirador",
            "Quanta fofura!",
            "Concordo totalmente!",
            "Hahaha, adorei essa parte",
            "Que texto incrível!",
            "Meu cachorro faria o mesmo!",
        ];

        const commentsToInsert: any[] = [];

        for (const post of posts) {
            const numComments = Math.floor(Math.random() * 60) + 30;

            for (let i = 0; i < numComments; i++) {
                const randomUser = accounts[Math.floor(Math.random() * accounts.length)];
                const randomContent =
                    exampleComments[Math.floor(Math.random() * exampleComments.length)];
                if(!randomUser) throw new Error("Nenhum usuário encontrado.");
                commentsToInsert.push({
                    post: post._id,
                    account: randomUser._id,
                    content: randomContent,
                    createdAt: new Date(),
                });
            }
        }

        await Comment.insertMany(commentsToInsert);

        console.log(
            `Seed de comentários executado com sucesso! (${commentsToInsert.length} criados)`
        );
    } catch (error) {
        console.error("Erro ao executar seed de comentários:", error);
    }
};