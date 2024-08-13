import 'dotenv/config';

const {
    PORT,
    NODE_ENV,
    MONGO_URL,
} = process.env;

export default {
    port: PORT ? parseInt(PORT, 10) : 5000,
    nodeEnv: NODE_ENV,
    mongoUrl: MONGO_URL
};