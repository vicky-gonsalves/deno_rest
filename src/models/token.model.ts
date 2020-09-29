import db from "../db/db.ts";

export interface TokenSchema {
  _id?: { $oid?: string };
  token: string;
  user: string;
  type: string;
  expires: Date;
  blacklisted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const Token = db.getDatabase.collection<TokenSchema>("tokens");
