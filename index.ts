import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import routes from "./src/routes/api.routes";
import { connectDB } from "./src/config/db";
import { errorHandler } from "./src/middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const port = process.env.PORT;

app.use('/api', routes);

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));