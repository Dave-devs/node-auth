import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../utils/config';

interface JwtPayload {
  id: string;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from headers
    const token = req.header('x-auth-token');

    if (!token) {
      return res
        .status(401)
        .json({ msg: 'No authentication token. Access denied!' });
    }

    // Verify token
    const decoded = jwt.verify(token, `${config.jwtSecret}`) as JwtPayload;

    if (!decoded) {
      return res
        .status(401)
        .json({ msg: 'Token verification failed. Access denied!' });
    }

    // Attach userId and token to request object
    req.userId = decoded.id;
    req.token = token;

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
