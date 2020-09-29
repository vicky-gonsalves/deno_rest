import configs from "../config/config.ts";
import {
  Jose,
  makeJwt,
  Payload,
  Status,
  validateJwt,
} from "../deps.ts";
import { throwError } from "../middlewares/errorHandler.middleware.ts";

const { jwtSecret } = configs;

const header: Jose = {
  alg: "HS256",
  typ: "JWT",
};

class JwtHelper {
  /**
   * Generate JWT token
   * @param expires
   * @param id
   * @returns Promise<string> Returns JWT
   */
  public static getToken(
    expires: number,
    id?: string,
  ): Promise<string> {
    const payload: Payload = {
      iss: "djwt",
      iat: Date.now(),
      id,
      exp: expires, // in seconds
    };
    return makeJwt({ header, payload, key: jwtSecret });
  }

  /**
   * Validates JWT and returns JWT payload
   * @param token
   * @returns Promise<Payload | Error> Returns JWT payload
   */
  public static async getJwtPayload(token: string): Promise<Payload | Error> {
    const jwtObject = await validateJwt(
      { jwt: token, key: jwtSecret, algorithm: "HS256" },
    );
    if (jwtObject.isValid && jwtObject.payload) {
      return jwtObject.payload;
    }
    return throwError({
      status: Status.Unauthorized,
      name: "Unauthorized",
      path: "access_token",
      param: "access_token",
      message: `access_token is expired`,
      type: "Unauthorized",
    });
  }
}

export default JwtHelper;
