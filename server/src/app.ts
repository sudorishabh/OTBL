import cookieParser from "cookie-parser";
import express, { json, urlencoded } from "express";
import cors from "./config/cors";

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);

export default app;
