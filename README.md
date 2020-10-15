# Deno REST - A Boilerplate for deno RESTful apis
<img src="https://deno.land/images/deno_logo_4.gif" alt="logo" width="300"/>

This is a Boilerplate project to create Deno RESTful API using oak and deno_mongo

### Features
- Model, Controller, Service based project structure
- MongoDB
- JWT authentication
- User authorization
- CORS
- environment management using .env
- Request validation
- Error Handling
- Database seeding
- User Roles and Rights
- Password Encryption using AES
- Denon Integration

### Libraries Used

 - [x] [Oak](https://deno.land/x/oak) - A middleware framework for Deno's net server
 - [x] [deno_mongo](https://deno.land/x/mongo) - MongoDB driver for Deno
 - [x] [cors](https://deno.land/x/cors) - Deno.js CORS middleware
 - [x] [djwt](https://deno.land/x/djwt) - To make JSON Web Tokens in deno. Based on JWT and JWS specifications.
 - [x] [yup](https://github.com/jquense/yup) - Schema builder for value parsing and validation
 - [x] [god_crypto](https://deno.land/x/god_crypto) - Encrypts passwords in AES to save in database collection.

## Getting Started
### Install / Upgrade
**Using Deno:**
```
deno upgrade --version 1.4.6
```


**With Shell:**
```
curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.4.6
```


**With PowerShell:**
```
$v="1.4.6"; iwr https://deno.land/x/install/install.ps1 -useb | iex
```


Clone this repository to your local machine
```
git clone https://github.com/vicky-gonsalves/deno_rest.git
```

**Directory Structure**
```
.
├── .env/
│   ├── .env.example
│   ├── .env.development  	// git ignored
│   ├── .env.production		// git ignored
│   └── .env.test			// git ignored
├── config/
│   ├── config.ts
│   └── roles.ts
├── controllers/
│   ├── auth.controller.ts
│   └── user.controller.ts
├── data/
│   └── users.json
├── db/
│   └── db.ts
├── helpers/
│   ├── hash.helper.ts
│   └── jwt.helper.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── errorHandler.middleware.ts
│   ├── logger.middleware.ts
│   └── validate.middleware.ts
├── models/
│   ├── token.model.ts
│   └── user.model.ts
├── routers/
│   ├── auth.router.ts
│   ├── default.router.ts
│   ├── index.ts
│   └── user.router.ts
├── services/
│   ├── auth.service.ts
│   ├── token.service.ts
│   └── user.service.ts
├── types/
│   └── types.interface.ts
├── validations/
│   ├── auth.validation.ts
│   └── user.validation.ts
├── .gitignore
├── app.ts
├── denon.json
├── deps.ts
├── lock.json
├── LICENSE
├── lock_update.sh
├── README.md
├── reload_deps.sh
├── seed.ts
└── tsconfig.json
```

## Setup
### Set environments
Review `.env/.env.example` file and create required `.env` file suitable to your needs.
For example: for development environment create a file `.env.development` under `.env` directory
for test environment create a file `.env.test` under `.env` directory and add necessary variables.

###  Install denon
If its your first run, please install `denon` from [https://deno.land/x/denon](https://deno.land/x/denon)

### Install Dependencies
To install dependencies, run following command in your terminal.
**Note: Terminal path must be project directory's root path**
```
deno cache --reload --unstable --lock-write --lock=lock.json ./deps.ts
```
**OR**
run the `reload_deps.sh` file from the project directory

This will automatically download all the dependencies and update `lock.json` file

### SEED Database
If you need to seed (run migrations) database initially,
Simply enable `SEED=true` in your .env file
You can add or edit any seed file under `data` directory. Basic example of seed file is provided in `data/users.json`

### Manually control  Individual seed file
Logic to control seed is located in `seed.ts` where you can add multiple seed files as follow:
```
const seedCollections: Array<Record<string, boolean>> = [
  { users: true },  // collection_name: boolean
  { posts: true },
  { comments: false},
  ...
  ...
```
**Note:** file name must be in `collection_name.json` pattern


### RUN
In your project root open terminal and run following command to run the project
```
denon start
```

##  User Roles and Rights
User roles are saved in `config/roles.ts` file as:
```
export const roles = ["user", "admin"];
```
and Rights are saved as:
```
roleRights.set(roles[0], [
  "getMe",
]);
roleRights.set(roles[1], [
  "getMe",
  "getUsers",
  "manageUsers",
]);
```
You can add/edit roles and rights as per your requirements.


## API Routes
All routes are stored under `routers` directory
Below is the example of `/api/users` route.
This route is JWT protected
In *user.router.ts*:
```
...
/** JWT protected route */
router.post(
  "/api/users",  						// route
  auth("manageUsers"),  				// Auth Guard based on djwt
  validate(createUserValidation),  		// Yup based validation
  UserController.create,  				// Controller Function
);
...
...
```
Non-JWT protected route:
```
router.post(
  "/api/auth/login",
  validate(loginValidation),  			// Yup based validation
  AuthController.login,
);
```

## Models
All models are under `models` directory
example of User Model:
```
import db from "../db/db.ts";

export interface UserSchema {
  _id?: { $oid?: string };
  name: string;
  email: string;
  password: string;
  role: string;
  isDisabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const User = db.getDatabase.collection<UserSchema>("users");
```
## Controllers
Controllers are saved under `controllers` directory
Example of User Controller:

```
...
class UserController {
/**
 * Create User function * @param request
 * @param response
 * @returns Promise<void>
 */public static async create(
  { request, response }: RouterContext,
): Promise<void> {
  const body = request.body();
  let {
    name,
    email,
    password,
    role,
    isDisabled,
  } = await body.value;
  log.debug("Creating user");
  response.body = await UserService.createUser({
    name,
    email,
    password,
    role: role || roles[0],
    isDisabled: typeof isDisabled === "boolean" ? isDisabled : false,
  });
}
...
...
```

## Services
All Services are under `services` directory
Example of User service:
```
class UserService {
  /**
 * Create user Service * @param options
 * @returns Promise<ObjectId | Error> Returns Mongo Id of user document
 */  public static async createUser(
    options: CreateUserStructure,
  ): Promise<ObjectId | Error> {
    const { name, email, password, role, isDisabled } = options;
    const hashedPassword = await HashHelper.encrypt(password);
    const createdAt = new Date();
    const user: ObjectId = await User.insertOne(
      { name, email, password: hashedPassword, role, isDisabled, createdAt },
    );
    if (!user) {
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
  ...
  ...

```

## Updating `lock.json`
In your project terminal run following command to update `lock.json` file with latest dependencies
```
deno cache --lock=lock.json --lock-write --unstable ./deps.ts
```
**OR**
simply run `lock_update.sh` file

## TODO
-- We are awaiting for a reliable mock library for mongoDB to perform tests.

 - [ ] Tests
 - [ ] Docker integration

## Known Issues
- Denon does not automatically restarts

## Contribution
All PRs are welcome

## LICENSE
MIT

