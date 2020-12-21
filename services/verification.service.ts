import config from "../config/config.ts";
import { Document, ObjectId, Status } from "../deps.ts";
import JwtHelper from "../helpers/jwt.helper.ts";
import { throwError } from "../middlewares/errorHandler.middleware.ts";
import {
  Verification,
  VerificationSchema,
} from "../models/verification.model.ts";
import type { VerificationTokenStructure } from "../types/types.interface.ts";

class VerificationService {
  /**
   * Save token service
   * @private
   * @param options Options: token, email, blacklisted are accepted
   * @returns Promise<Document> Returns Mongodb Document
   */
  private static saveTokenService(
    options: VerificationSchema,
  ): Promise<Document> {
    const createdAt = new Date();
    const { token, email, blacklisted } = options;
    return Verification.insertOne(
      { token, email, blacklisted, createdAt },
    );
  }

  /**
   * Generate Verification token(JWT) service for register user
   * @param email User's email
   * @returns Promise<VerificationTokenStructure | Error> Returns access and refresh tokens with expiry
   */
  public static async generateVerificationTokensService(
    email?: string,
  ): Promise<VerificationTokenStructure | Error> {
    if (!email) {
      return throwError({
        status: Status.NotFound,
        name: "NotFound",
        path: "access_token",
        param: "access_token",
        message: `email is invalid`,
        type: "NotFound",
      });
    }

    token = v4.generate();

    const verificationTokenExpires = config.jwtAccessExpiration;
    const verificationToken = await JwtHelper.getToken(
      verificationTokenExpires,
      email,
    );

    await this.saveTokenService({
      token: verificationToken,
      email: email,
      expires: new Date(verificationTokenExpires * 1000), // milliseconds
      blacklisted: false,
    });

    return {
      verification: {
        token: verificationToken,
        expires: new Date(verificationTokenExpires * 1000), // milliseconds,
      },
    };
  }

  /**
   * Verify JWT service
   * @param token JWT token
   * @returns Promise<TokenSchema | Error> Returns decrypted payload from JWT
   */
  public static async verifyTokenService(
    token: string,
  ): Promise<VerificationSchema | Error> {
    // deno-lint-ignore no-explicit-any
    const payload: any = await JwtHelper.getJwtPayload(token);
    const tokenDoc = await Verification.findOne(
      { token, email: payload.id, blacklisted: false },
    );
    if (!tokenDoc) {
      return throwError({
        status: Status.Unauthorized,
        name: "Unauthorized",
        path: `token`,
        param: `token`,
        message: `token is invalid`,
        type: "Unauthorized",
      });
    }
    return tokenDoc;
  }

  /**
   * Delete existing refresh token(JWT) from database service
   * @param id
   * @returns Promise<number | Error> Returns deleted count
   */
  public static async removeExistingRefreshToken(
    id?: string,
  ): Promise<number | Error> {
    if (!id) {
      return throwError({
        status: Status.NotFound,
        name: "NotFound",
        path: "token",
        param: "token",
        message: `token not found`,
        type: "NotFound",
      });
    }
    const deleteCount: number = await Verification.deleteOne(
      { _id: new ObjectId(id) },
    );
    if (!deleteCount) {
      return throwError({
        status: Status.NotFound,
        name: "NotFound",
        path: "refresh_token",
        param: "refresh_token",
        message: `refresh_token not found`,
        type: "NotFound",
      });
    }
    return deleteCount;
  }
}

export default VerificationService;
