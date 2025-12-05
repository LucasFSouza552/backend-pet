import { Account } from "@models/account";
import { Post } from "@models/post";

export const seedPosts = async () => {
    try {
        await Post.deleteMany({});
        console.log("Posts anteriores removidos");

        const account = await Account.findOne({ role: "admin" });

        if (!account) {
            throw new Error("Nenhuma conta de usuário encontrada para associar aos posts.");
        }

        const postsData = [
            { content: "Um abraço do seu cachorro pode mudar o seu dia." },
            { content: "Nada se compara a um ronronar de gato para acalmar a mente." },
            { content: "Levar seu pet para correr e brincar faz bem para ambos." },
            { content: "Banho de cachorro: diversão garantida e cheirinho gostoso." },
            { content: "Cães e gatos podem ensinar muito sobre amizade verdadeira." },
            { content: "Nada como compartilhar um lanche e momentos de alegria com seu amigo de quatro patas." },
            { content: "Dar um lar para um animal é receber amor sem medidas." },
            { content: "Olhares de filhotes derretem qualquer coração." },
            { content: "Ensinar truques ao seu cachorro pode ser divertido e fortalecer a conexão entre vocês." },
            { content: "Fotos com seu animal de estimação sempre arrancam sorrisos." },
            { content: "Correr atrás da bola nunca é só para eles: a diversão é mútua." },
            { content: "Ver seu gato dormindo confortavelmente é pura paz." },
            { content: "Descobrir curiosidades de animais diferentes é incrível." },
            { content: "Animais nos ensinam a amar sem esperar nada em troca." },
            { content: "Correr com seu cachorro pela manhã é revigorante e saudável." },
            { content: "Nada como um filme e seu pet ao lado para relaxar." },
            { content: "Ver a felicidade deles ao comer aquece o coração." },
            { content: "Cuidar de animais mais velhos é uma lição de paciência e carinho." },
            { content: "Gatos exploradores sempre surpreendem com suas travessuras." },
            { content: "Ver cães e gatos brincando juntos é encantador." },
            { content: "Roupinhas para pets podem ser fofas e divertidas." },
            { content: "Escovar os pelos do seu pet fortalece o vínculo e mantém a saúde." },
            { content: "Cachorros adoram sentir a areia e o vento no rosto." },
            { content: "Pets têm o dom de nos fazer rir sem perceber." },
            { content: "Um cachorro feliz faz todos ao redor sorrirem." },
            { content: "A curiosidade felina é fonte de diversão diária." },
            { content: "Meditar com seu animal próximo pode ser surpreendentemente relaxante." },
            { content: "Animais se divertem como crianças quando encontram a neve." },
            { content: "Uma caminhada à noite com seu pet é tranquila e cheia de paz." },
            { content: "Animais ajudam no desenvolvimento emocional das crianças e no carinho." },
        ].map(post => ({ ...post, account: account._id }));

        await Post.insertMany(postsData);

        console.log("Seed de posts executado com sucesso!");
    } catch (error) {
        console.error("Erro ao executar seed de posts:", error);
    }
};
