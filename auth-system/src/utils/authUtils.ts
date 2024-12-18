import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Hash a password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT tokens
export const generateToken = (id: string, expiresIn: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn });
};

export const generateRefreshToken = (id: string, expiresIn: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, { expiresIn });
};

// Generate random reset token
export const generateResetToken = (): string => {
  return crypto.randomBytes(20).toString('hex');
};
