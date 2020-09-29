import { Status } from "../deps.ts";
import HashHelper from "../helpers/hash.helper.ts";
import { throwError } from "../middlewares/errorHandler.middleware.ts";
import type { TokenSchema } from "../models/token.model.ts";
import { User, UserSchema } from "../models/user.model.ts";
import type {
  LoginStructure,
  TokenStructure,
  UserStructure,
} from "../types/types.interface.ts";
import TokenService from "./token.service.ts";
import UserService from "./user.service.ts";

class AuthService {
  /**
   * Login service
   * @param email
   * @param password
   * @returns Promise<LoginStructure | Error> returns tokens with user object
   */
  public static async login(
    { email, password }: { email: string; password: string },
  ): Promise<LoginStructure | Error> {
    const user: UserSchema | null = await User.findOne(
      { email, isDisabled: false },
    );
    if (
      user && user.password && await HashHelper.compare(password, user.password)
    ) {
      const { _id, name, email, role, isDisabled, createdAt, updatedAt }:
        UserSchema = user;
      const tokens: TokenStructure | Error = await TokenService
        .generateAuthTokensService(_id?.$oid);
      return ({
        tokens,
        user: {
          id: _id?.$oid as string,
          name,
          email,
          role,
          isDisabled,
          createdAt,
          updatedAt,
        },
      });
    }
    return throwError({
      status: Status.Unauthorized,
      name: "Unauthorized",
      path: "password",
      param: "password",
      message: `email or password is not correct`,
      type: "Unauthorized",
    });
  }

  /**
   * Get Refresh token service
   * @param token
   * @returns Promise<TokenStructure | Error> returns Tokens
   */
  public static async getRefreshToken(
    token: string,
  ): Promise<TokenStructure | Error> {
    const refreshTokenDoc: TokenSchema | Error = await TokenService
      .verifyTokenService(token, "refresh");
    if ("user" in refreshTokenDoc) {
      const userId = refreshTokenDoc.user;
      const user: UserStructure | Error = await UserService.getUser(userId);
      await TokenService.removeExistingRefreshToken(refreshTokenDoc._id?.$oid);
      return await TokenService.generateRefreshTokensService(
        "id" in user ? user.id : undefined,
      );
    }
    return throwError({
      status: Status.BadRequest,
      name: "BadRequest",
      path: "refresh_token",
      param: "refresh_token",
      message: `refresh_token is invalid`,
      type: "BadRequest",
    });
  }
}

export default AuthService;
