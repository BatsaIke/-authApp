import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Minimal user payload interface for JWT decoding
interface UserPayload {
  id: string;
}

// Extended request interface with custom property
export interface AuthRequest extends Request {
  authUser?: UserPayload; // Custom property for authenticated user
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Unauthorized - No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    req.authUser = { id: decoded.id };
    next();
  } catch (error) {
    console.error('Token Verification Error:', error);
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};
