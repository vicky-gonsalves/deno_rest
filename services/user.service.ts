import { Document, ObjectId, Status } from "../deps.ts";
import HashHelper from "../helpers/hash.helper.ts";
import { throwError } from "../middlewares/errorHandler.middleware.ts";
import log from "../middlewares/logger.middleware.ts";
import { User, UserSchema } from "../models/user.model.ts";
import { UserHistory } from "../models/user_history.model.ts";
import type {
  CreateUserStructure,
  SignupUserStructure,
  UpdatedStructure,
  UpdateUserStructure,
  UserStructure,
} from "../types/types.interface.ts";

class UserService {
  /**
   * Create user Service
   * @param options
   * @returns Promise<Document | Error> Returns Mongo Document of user
   */
  public static async createUser(
    options: CreateUserStructure,
  ): Promise<Document | Error> {
    const { name, email, password, role, isVerified, isDisabled } = options;
    const hashedPassword = await HashHelper.encrypt(password);
    const createdAt = new Date();

    const user: Document = await User.insertOne(
      {
        name,
        email,
        password: hashedPassword,
        role,
        isVerified,
        isDisabled,
        createdAt,
        __v: 1,
      },
    );

    if (user) {
      await UserHistory.insertOne(
        {
          id: user,
          name,
          email,
          password: hashedPassword,
          role,
          isVerified,
          isDisabled,
          createdAt,
          __v: 1,
        },
      );
    } else {
      log.error("Could not create user");
      return throwError({
        status: Status.BadRequest,
        name: "BadRequest",
        path: "user",
        param: "user",
        message: `Could not create user`,
        type: "BadRequest",
      });
    }
    return user;
  }

  /**
   * Signup user Service
   * @returns Promise<Document | Error> Returns Mongo Id of user document
   * @param options
   */
  public static async signupUser(
    options: SignupUserStructure,
  ): Promise<Document | Error> {
    const { name, email, password, role, isVerified, isDisabled } = options;
    const hashedPassword = await HashHelper.encrypt(password);
    const createdAt = new Date();

    const user: Document = await User.insertOne(
      {
        name,
        email,
        password: hashedPassword,
        role,
        isVerified,
        isDisabled,
        createdAt,
        __v: 1,
      },
    );

    if (user) {
      await UserHistory.insertOne(
        {
          id: user,
          name,
          email,
          password: hashedPassword,
          role,
          isVerified,
          isDisabled,
          createdAt,
          __v: 1,
        },
      );
    } else {
      log.error("Could not create user");
      return throwError({
        status: Status.BadRequest,
        name: "BadRequest",
        path: "user",
        param: "user",
        message: `Could not create user`,
        type: "BadRequest",
      });
    }
    return user;
  }

  /**
   * Get users service
   * @returns Promise<UserSchema[]> Returns Array of users documents
   */
  public static getUsers(): Promise<UserSchema[]> {
    return User.find().toArray();
  }

  /**
   * Get single user service
   * @param id
   * @returns Promise<UserSchema | Error> Returns user document
   */
  public static async getUser(id: string): Promise<UserStructure | Error> {
    const user: (UserSchema | undefined) = await User.findOne(
      { _id: new ObjectId(id) },
    );
    if (!user) {
      log.error("User not found");
      return throwError({
        status: Status.NotFound,
        name: "NotFound",
        path: "user",
        param: "user",
        message: `User not found`,
        type: "NotFound",
      });
    }
    const { name, email, role, isDisabled, isVerified, createdAt, updatedAt } =
      user;
    return {
      id,
      name,
      email,
      role,
      isDisabled,
      isVerified,
      createdAt,
      updatedAt,
    };
  }

  /**
   * Update user service
   * @param id
   * @param options
   * @returns Promise<UpdatedStructure | Error> Returns Updated acknowledgement
   */
  public static async updateUser(
    id: string,
    options: UpdateUserStructure,
  ): Promise<UpdatedStructure | Error> {
    const user: (UserSchema | undefined) = await User.findOne(
      { _id: new ObjectId(id) },
    );
    if (!user) {
      log.error("User not found");
      return throwError({
        status: Status.NotFound,
        name: "NotFound",
        path: "user",
        param: "user",
        message: `User not found`,
        type: "NotFound",
      });
    }
    const { __v } = user;
    const NEW___V = __v + 1;
    const { name, role, isVerified, isDisabled } = options;
    const updatedAt = new Date();
    const result: ({
      // deno-lint-ignore no-explicit-any
      upsertedId: any;
      upsertedCount: number;
      matchedCount: number;
      modifiedCount: number;
    }) = await User.updateOne({ _id: new ObjectId(id) }, {
      $set: {
        name,
        role,
        isVerified,
        isDisabled,
        updatedAt,
        __v: NEW___V,
      },
    });
    if (result) {
      await UserHistory.insertOne(
        {
          id: new ObjectId(id),
          name,
          role,
          isVerified,
          isDisabled,
          updatedAt,
          __v: NEW___V,
        },
      );
    } else {
      return throwError({
        status: Status.BadRequest,
        name: "BadRequest",
        path: "user",
        param: "user",
        message: `Could not update user`,
        type: "BadRequest",
      });
    }

    return result;
  }

  /**
   * Remove user service
   * @param id
   * @returns Promise<number | Error Returns deleted count
   */
  public static async removeUser(id: string): Promise<number | Error> {
    const user: (UserSchema | undefined) = await User.findOne(
      { _id: new ObjectId(id) },
    );
    if (!user) {
      log.error("User not found");
      return throwError({
        status: Status.NotFound,
        name: "NotFound",
        path: "user",
        param: "user",
        message: `User not found`,
        type: "NotFound",
      });
    }
    const deleteCount: number = await User.deleteOne({ _id: new ObjectId(id) });
    if (deleteCount) {
      const { name, email, role, isVerified, isDisabled, createdAt, __v } =
        user;
      const NEW___V = __v + 1;
      const updatedAt = new Date();
      await UserHistory.insertOne(
        {
          id: new ObjectId(id),
          name,
          email,
          role,
          isVerified,
          isDisabled,
          createdAt,
          updatedAt,
          __v: NEW___V,
        },
      );
    } else {
      return throwError({
        status: Status.BadRequest,
        name: "BadRequest",
        path: "user",
        param: "user",
        message: `Could not delete user`,
        type: "BadRequest",
      });
    }
    return deleteCount;
  }
}

export default UserService;
