import type { ObjectId } from "../deps.ts";

export interface VerificationTokenStructure {
  verify: { expires: Date; token: string };
}

export interface TokenStructure {
  access: { expires: Date; token: string };
  refresh: { expires: Date; token: string };
}

export interface UserStructure {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginStructure {
  tokens: TokenStructure | Error;
  user: UserStructure;
}

export interface CreateUserStructure {
  name: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
}

export interface SignupUserStructure {
  name: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
}

export interface UpdateUserStructure {
  name?: string;
  role?: string;
  isVerified?: boolean;
  isDisabled?: boolean;
}

export interface UpdatedStructure {
  matchedCount: number;
  modifiedCount: number;
  upsertedId: typeof ObjectId | null;
}

export interface Err {
  status: number;
  name: string;
  path: string;
  param: string;
  message: string;
  type: string;
}

export interface JwtPayload {
  iss: string;
  iat: number;
  id: string;
  exp: number;
}
