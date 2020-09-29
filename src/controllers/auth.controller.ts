import type { RouterContext } from "../deps.ts";
import log from "../middlewares/logger.middleware.ts";
import AuthService from "../services/auth.service.ts";

class AuthController {
  /**
   * Login function
   * @param request
   * @param response
   * @returns Promise<void>
   */
  public static async login(
    { request, response }: RouterContext,
  ): Promise<void> {
    const body = request.body();
    let { email, password } = await body.value;
    log.debug("Trying Login user");
    response.body = await AuthService.login({ email, password });
  }

  /**
   * Refresh Token function
   * @param request
   * @param response
   * @returns Promise<void>
   */
  public static async refreshTokens(
    { request, response }: RouterContext,
  ): Promise<void> {
    const body = request.body();
    let { refreshToken } = await body.value;
    log.debug("Getting refresh token");
    response.body = await AuthService.getRefreshToken(refreshToken);
  }
}

export default AuthController;
