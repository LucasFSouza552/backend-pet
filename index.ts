import 'tsconfig-paths/register';
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import routes from "@routes/api.routes";
import { connectDB } from "@config/db";
import { errorHandler } from "@middleware/errorHandler";
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas tentativas, tente novamente em 15 minutos'
});

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', "Access-Control-Allow-Origin"]
}));

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

connectDB();

const port = process.env.PORT;

app.use('/api', limiter, routes);

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));