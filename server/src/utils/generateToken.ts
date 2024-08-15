import jwt from 'jsonwebtoken';
import config from './config';

export const generateToken = (userId: string) => {
    const token = jwt.sign({ userId }, config.jwtSecret!, {
        expiresIn: '7d',
    });

    return token;
};
