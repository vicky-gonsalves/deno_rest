import db from "../db/db.ts";

export interface VerificationSchema {
  _id: { $oid?: string };
  blacklisted: boolean;
  token: string; // AES_ENCRYPTED_KEY
  email: string; // User's Email
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export const Verification = db.getDatabase.collection<VerificationSchema>(
  "verifications",
);
