import cookieParser from "cookie-parser";
import express, { json, urlencoded } from "express";

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

export default app;
