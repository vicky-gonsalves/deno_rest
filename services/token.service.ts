import config from "../config/config.ts";
import { Document, ObjectId, Status } from "../deps.ts";
import JwtHelper from "../helpers/jwt.helper.ts";
import { throwError } from "../middlewares/errorHandler.middleware.ts";
import { Token, TokenSchema } from "../models/token.model.ts";
import type { TokenStructure } from "../types/types.interface.ts";
import {} from "../helpers/hash.helper.ts";

class TokenService {
  /**
   * Save token service
   * @private
   * @param options Options: token, user, expires, type,blacklisted are accepted
   * @returns Promise<Document> Returns Mongodb Document
   */
  private static saveTokenService(options: TokenSchema): Promise<Document> {
    const createdAt = new Date();
    const { token, user, expires, type, blacklisted } = options;
    return Token.insertOne(
      { token, user, expires, type, blacklisted, createdAt },
    );
  }

  /**
   * Generate Auth token(JWT) service for login user
   * @param userId User's Mongo id
   * @returns Promise<TokenStructure | Error> Returns access and refresh tokens with expiry
   */
  public static async generateAuthTokensService(
    userId?: string,
  ): Promise<TokenStructure | Error> {
    if (!userId) {
      return throwError({
        status: Status.NotFound,
        name: "NotFound",
        path: "access_token",
        param: "access_token",
        message: `userId is invalid`,
        type: "NotFound",
      });
    }
    const accessTokenExpires = config.jwtAccessExpiration;
    const accessToken = await JwtHelper.getToken(accessTokenExpires, userId);
    const refreshTokenExpires = config.jwtRefreshExpiration;
    const refreshToken = await JwtHelper.getToken(refreshTokenExpires, userId);

    await this.saveTokenService({
      token: refreshToken,
      user: userId,
      expires: new Date(refreshTokenExpires * 1000), // milliseconds
      type: "refresh",
      blacklisted: false,
    });
    return {
      access: {
        token: accessToken,
        expires: new Date(accessTokenExpires * 1000), // milliseconds,
      },
      refresh: {
        token: refreshToken,
        expires: new Date(refreshTokenExpires * 1000), // milliseconds,
      },
    };
  }

  /**
   * Generate Refresh token(JWT) service for generating new refresh and access tokens
   * @param userId User's Mongo id
   * @returns Promise<TokenStructure | Error> Returns access and refresh tokens with expiry
   */
  public static async generateRefreshTokensService(
    userId?: string,
  ): Promise<TokenStructure | Error> {
    if (!userId) {
      return throwError({
        status: Status.NotFound,
        name: "NotFound",
        path: "refresh_token",
        param: "refresh_token",
        message: `userId is invalid`,
        type: "NotFound",
      });
    }
    return await this.generateAuthTokensService(
      userId,
    );
  }

  /**
   * Verify JWT service
   * @param token JWT token
   * @param type "refresh" or "access"
   * @returns Promise<TokenSchema | Error> Returns decrypted payload from JWT
   */
  public static async verifyTokenService(
    token: string,
    type: string,
  ): Promise<TokenSchema | Error> {
    // deno-lint-ignore no-explicit-any
    const payload: any = await JwtHelper.getJwtPayload(token);
    const tokenDoc = await Token.findOne(
      { token, type, user: payload.id, blacklisted: false },
    );
    if (!tokenDoc) {
      return throwError({
        status: Status.Unauthorized,
        name: "Unauthorized",
        path: `${type}_token`,
        param: `${type}_token`,
        message: `${type}_token is invalid`,
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
    const deleteCount: number = await Token.deleteOne(
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

export default TokenService;
