import { MercadoPagoConfig, Order, Payment, Preference } from "mercadopago";
import dotenv from "dotenv";
dotenv.config();

function getMercadoPagoConfig() {

    return {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
        options: { timeout: 5000 },
    };
}

const client = new MercadoPagoConfig(getMercadoPagoConfig());

const order = new Order(client);

const payment = new Payment(client);

const preference = new Preference(client);

export { order, payment, preference };