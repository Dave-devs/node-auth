import express, { Application } from "express";
import { connectDB } from "./database/connectDB";
import config from "./utils/config";
import { authRouter } from './routes/auth.routes';
import cors from 'cors';


const app: Application = express();
const PORT = config.port;

app.use(cors({ origin: `${config.origin}`, credentials: true }));
app.use(express.json());
app.use('/api/auth', authRouter);


app.listen(config.port, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});

