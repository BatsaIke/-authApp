import { Request } from 'express';

// Minimal user payload interface for JWT decoding
interface UserPayload {
  id: string;
}

// Extended request interface with authUser property
export interface AuthRequest extends Request {
  authUser?: UserPayload;
}
