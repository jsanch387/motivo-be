// src/common/utils/RequestWithUser.ts

import { Request } from 'express';

export interface SupabaseUser {
  id: string;
  email?: string;
  role?: string;
  // Add more fields if you need them later
}

export interface RequestWithUser extends Request {
  user: SupabaseUser;
}
