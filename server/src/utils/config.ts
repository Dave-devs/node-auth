import 'dotenv/config';

const {
    PORT,
    NODE_ENV,
    MONGO_URL,
    JWT_SECRET,
    EMAIL_USER,
    EMAIL_PASS,
    CLIENT_URL,
    ORIGIN,
} = process.env;

export default {
    port: PORT ? parseInt(PORT, 10) : 5000,
    nodeEnv: NODE_ENV,
    mongoUrl: MONGO_URL,
    jwtSecret: JWT_SECRET,
    email: EMAIL_USER,
    emailPass: EMAIL_PASS,
    clientUrl: CLIENT_URL,
    origin: ORIGIN ? ORIGIN : CLIENT_URL,
};