import { Account } from "../models/Account";
import { Post } from "../models/Post";

export const seedPosts = async () => {
    await Post.deleteMany({});

    const accounts = await Account.find();

    await Post.create([
        {
            "title": "Cãopanheiro de todas as horas",
            "content": "Um abraço do seu cachorro pode mudar o seu dia.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Gatinhos fofos",
            "content": "Nada se compara a um ronronar de gato para acalmar a mente.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Passeio no parque",
            "content": "Levar seu pet para correr e brincar faz bem para ambos.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Hora do banho",
            "content": "Banho de cachorro: diversão garantida e cheirinho gostoso.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Amigos peludos",
            "content": "Cães e gatos podem ensinar muito sobre amizade verdadeira.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Piquenique com o pet",
            "content": "Nada como compartilhar um lanche e momentos de alegria com seu amigo de quatro patas.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Adote um amigo",
            "content": "Dar um lar para um animal é receber amor sem medidas.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Filhotes adoráveis",
            "content": "Olhares de filhotes derretem qualquer coração.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Treinamento divertido",
            "content": "Ensinar truques ao seu cachorro pode ser divertido e fortalecer a conexão entre vocês.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Selfie com o pet",
            "content": "Fotos com seu animal de estimação sempre arrancam sorrisos.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Brincadeira ao ar livre",
            "content": "Correr atrás da bola nunca é só para eles: a diversão é mútua.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Hora do cochilo",
            "content": "Ver seu gato dormindo confortavelmente é pura paz.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Animais exóticos",
            "content": "Descobrir curiosidades de animais diferentes é incrível.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Amor sem condições",
            "content": "Animais nos ensinam a amar sem esperar nada em troca.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Corrida matinal",
            "content": "Correr com seu cachorro pela manhã é revigorante e saudável.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Companhia no sofá",
            "content": "Nada como um filme e seu pet ao lado para relaxar.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Hora da comida",
            "content": "Ver a felicidade deles ao comer aquece o coração.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Pets idosos",
            "content": "Cuidar de animais mais velhos é uma lição de paciência e carinho.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Aventuras de gato",
            "content": "Gatos exploradores sempre surpreendem com suas travessuras.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Amizade entre espécies",
            "content": "Ver cães e gatos brincando juntos é encantador.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Pet fashion",
            "content": "Roupinhas para pets podem ser fofas e divertidas.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Hora da escovação",
            "content": "Escovar os pelos do seu pet fortalece o vínculo e mantém a saúde.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Corrida na praia",
            "content": "Cachorros adoram sentir a areia e o vento no rosto.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Momentos engraçados",
            "content": "Pets têm o dom de nos fazer rir sem perceber.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Amor canino",
            "content": "Um cachorro feliz faz todos ao redor sorrirem.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Gatos curiosos",
            "content": "A curiosidade felina é fonte de diversão diária.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Pet zen",
            "content": "Meditar com seu animal próximo pode ser surpreendentemente relaxante.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Brincadeiras na neve",
            "content": "Animais se divertem como crianças quando encontram a neve.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Passeio noturno",
            "content": "Uma caminhada à noite com seu pet é tranquila e cheia de paz.",
            "accountId": accounts[0]?._id
        },
        {
            "title": "Pets e crianças",
            "content": "Animais ajudam no desenvolvimento emocional das crianças e no carinho.",
            "accountId": accounts[0]?._id
        }]);

    console.log("✅ Posts seed executed");

};