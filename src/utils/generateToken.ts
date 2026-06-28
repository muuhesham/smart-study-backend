import jwt from 'jsonwebtoken';
import { JWT_KEY } from '../config/env.js';

const expiresIn = '1h';

interface TokenPayload {
    _id: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_KEY!, { expiresIn });
};