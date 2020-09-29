import { Router } from "../deps.ts";
import UserController from "../controllers/user.controller.ts";
import { auth } from "../middlewares/auth.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import {
  createUserValidation,
  deleteUserValidation,
  getUsersValidation,
  getUserValidation,
  meValidation,
  updateUserValidation,
} from "../validations/user.validation.ts";

const router: Router = new Router();

router.post(
  "/api/users",
  auth("manageUsers"),
  validate(createUserValidation),
  UserController.create,
);

router.get(
  "/api/users",
  auth("getUsers"),
  validate(getUsersValidation),
  UserController.fetch,
);

router.get(
  "/api/me",
  auth("getMe"),
  validate(meValidation),
  UserController.me,
);

router.get(
  "/api/users/:id",
  auth("getUsers"),
  validate(getUserValidation),
  UserController.show,
);

router.put(
  "/api/users/:id",
  auth("manageUsers"),
  validate(updateUserValidation),
  UserController.update,
);

router.delete(
  "/api/users/:id",
  auth("manageUsers"),
  validate(deleteUserValidation),
  UserController.remove,
);

export default router;
