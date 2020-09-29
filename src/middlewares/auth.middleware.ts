import { roleRights } from "../config/roles.ts";
import { Context, Status } from "../deps.ts";
import JwtHelper from "../helpers/jwt.helper.ts";
import UserService from "../services/user.service.ts";
import type { UserStructure } from "../types/types.interface.ts";
import { throwError } from "./errorHandler.middleware.ts";

/**
 * Check user Rights
 * @param requiredRights
 * @param user
 * @returns boolean | Error Returns if user has sufficient rights
 */
const checkRights = (
  requiredRights: string[],
  user: UserStructure,
): boolean | Error => {
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) =>
      userRights.includes(requiredRight)
    );
    if (!hasRequiredRights) {
      return throwError({
        status: Status.Forbidden,
        name: "Forbidden",
        path: `access_token`,
        param: `access_token`,
        message: `Insufficient rights`,
        type: "Forbidden",
      });
    }
  }
  return true;
};

/**
 * Auth Middleware
 * @param requiredRights
 * @returns Promise<void>
 */
export const auth = (...requiredRights: string[]) =>
  async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    let JWT: string;
    const jwt: string = ctx.request.headers.get("Authorization")
      ? ctx.request.headers.get("Authorization")!
      : "";
    if (jwt && jwt.includes("Bearer")) {
      JWT = jwt.split("Bearer ")[1];
      // deno-lint-ignore no-explicit-any
      const data: any | Error = await JwtHelper.getJwtPayload(JWT);
      if (data) {
        const user: UserStructure | Error = await UserService.getUser(data.id);
        if (user && checkRights(requiredRights, user as UserStructure)) {
          ctx.state = user;
        }
      } else {
        throwError({
          status: Status.Unauthorized,
          name: "Unauthorized",
          path: `access_token`,
          param: `access_token`,
          message: `access_token is invalid`,
          type: "Unauthorized",
        });
      }
    } else {
      throwError({
        status: Status.Unauthorized,
        name: "Unauthorized",
        path: `access_token`,
        param: `access_token`,
        message: `access_token is required`,
        type: "Unauthorized",
      });
    }
    await next();
  };
