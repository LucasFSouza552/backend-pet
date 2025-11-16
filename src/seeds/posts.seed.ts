import { Account } from "@models/account";
import { Post } from "@models/post";

export const seedPosts = async () => {
    try {
        await Post.deleteMany({});
        console.log("🗑️ Posts anteriores removidos");

        const account = await Account.findOne({ role: "admin" });

        if (!account) {
            throw new Error("❌ Nenhuma conta de usuário encontrada para associar aos posts.");
        }

        const postsData = [
            { title: "Cãopanheiro de todas as horas", content: "Um abraço do seu cachorro pode mudar o seu dia." },
            { title: "Gatinhos fofos", content: "Nada se compara a um ronronar de gato para acalmar a mente." },
            { title: "Passeio no parque", content: "Levar seu pet para correr e brincar faz bem para ambos." },
            { title: "Hora do banho", content: "Banho de cachorro: diversão garantida e cheirinho gostoso." },
            { title: "Amigos peludos", content: "Cães e gatos podem ensinar muito sobre amizade verdadeira." },
            { title: "Piquenique com o pet", content: "Nada como compartilhar um lanche e momentos de alegria com seu amigo de quatro patas." },
            { title: "Adote um amigo", content: "Dar um lar para um animal é receber amor sem medidas." },
            { title: "Filhotes adoráveis", content: "Olhares de filhotes derretem qualquer coração." },
            { title: "Treinamento divertido", content: "Ensinar truques ao seu cachorro pode ser divertido e fortalecer a conexão entre vocês." },
            { title: "Selfie com o pet", content: "Fotos com seu animal de estimação sempre arrancam sorrisos." },
            { title: "Brincadeira ao ar livre", content: "Correr atrás da bola nunca é só para eles: a diversão é mútua." },
            { title: "Hora do cochilo", content: "Ver seu gato dormindo confortavelmente é pura paz." },
            { title: "Animais exóticos", content: "Descobrir curiosidades de animais diferentes é incrível." },
            { title: "Amor sem condições", content: "Animais nos ensinam a amar sem esperar nada em troca." },
            { title: "Corrida matinal", content: "Correr com seu cachorro pela manhã é revigorante e saudável." },
            { title: "Companhia no sofá", content: "Nada como um filme e seu pet ao lado para relaxar." },
            { title: "Hora da comida", content: "Ver a felicidade deles ao comer aquece o coração." },
            { title: "Pets idosos", content: "Cuidar de animais mais velhos é uma lição de paciência e carinho." },
            { title: "Aventuras de gato", content: "Gatos exploradores sempre surpreendem com suas travessuras." },
            { title: "Amizade entre espécies", content: "Ver cães e gatos brincando juntos é encantador." },
            { title: "Pet fashion", content: "Roupinhas para pets podem ser fofas e divertidas." },
            { title: "Hora da escovação", content: "Escovar os pelos do seu pet fortalece o vínculo e mantém a saúde." },
            { title: "Corrida na praia", content: "Cachorros adoram sentir a areia e o vento no rosto." },
            { title: "Momentos engraçados", content: "Pets têm o dom de nos fazer rir sem perceber." },
            { title: "Amor canino", content: "Um cachorro feliz faz todos ao redor sorrirem." },
            { title: "Gatos curiosos", content: "A curiosidade felina é fonte de diversão diária." },
            { title: "Pet zen", content: "Meditar com seu animal próximo pode ser surpreendentemente relaxante." },
            { title: "Brincadeiras na neve", content: "Animais se divertem como crianças quando encontram a neve." },
            { title: "Passeio noturno", content: "Uma caminhada à noite com seu pet é tranquila e cheia de paz." },
            { title: "Pets e crianças", content: "Animais ajudam no desenvolvimento emocional das crianças e no carinho." },
        ].map(post => ({ ...post, account: account._id }));

        await Post.insertMany(postsData);

        console.log("✅ Seed de posts executado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao executar seed de posts:", error);
    }
};
