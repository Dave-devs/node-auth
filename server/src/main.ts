import express, { Application, Request, Response } from "express";
import { connectDB } from "./database/connectDB";
import config from "./utils/config";

const PORT = config.port;

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  console.log('Hello World!');
  res.send('Hello World!');
});

app.listen(config.port, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});

