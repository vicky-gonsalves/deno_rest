import type { Application } from "../deps.ts";
import defaultRouter from "./default.router.ts";
import userRouter from "./user.router.ts";
import authRouter from "./auth.router.ts";

const init = (app: Application) => {
  app.use(authRouter.routes());
  app.use(userRouter.routes());
  app.use(defaultRouter.routes());

  app.use(authRouter.allowedMethods());
  app.use(userRouter.allowedMethods());
  app.use(defaultRouter.allowedMethods());
};

export default {
  init,
};
