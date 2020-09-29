import db from "../db/db.ts";

export interface UserSchema {
  _id?: { $oid?: string };
  name: string;
  email: string;
  password: string;
  role: string;
  isDisabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const User = db.getDatabase.collection<UserSchema>("users");
