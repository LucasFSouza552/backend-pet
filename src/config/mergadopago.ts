import { MercadoPagoConfig, Order } from "mercadopago";

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
    options: { timeout: 5000 },
});

const order = new Order(client);

export { order };