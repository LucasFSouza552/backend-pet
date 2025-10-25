import 'tsconfig-paths/register';
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import routes from "./routes/api.routes";
import { connectDB } from "./config/db";
import rateLimit from 'express-rate-limit';
import { errorHandler } from "./middleware/errorHandler";
import helmet from 'helmet';
import path from 'path';

const publicPath = path.join(__dirname, '../public');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: 'Muitas tentativas, tente novamente em 15 minutos'
});

app.use(cors({
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', "Access-Control-Allow-Origin"]
}));

app.set("trust proxy", 2);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "blob:", "http:"]
            },
        },
    })
);

app.use(express.json());
app.use(express.static(publicPath));

connectDB();

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, 'view/index.html'));
});

app.use('/api', limiter, routes);

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));