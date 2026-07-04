import jwt from "jsonwebtoken";

export function verifyToken(token: string, secretKey: string): any {
    return jwt.verify(token, secretKey);
};