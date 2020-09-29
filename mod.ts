import Ask from "https://raw.githubusercontent.com/vicky-gonsalves/ask/master/mod.ts"; //  Add original source once PR is merged
import { bold, green, red } from "https://deno.land/std/fmt/colors.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { existsSync, copySync } from "https://deno.land/std/fs/mod.ts";
import { generatePass } from "https://deno.land/x/passgen/mod.ts";

interface Configs {
  name: string;
  useCurrentPath: boolean;
  path: string;
  dbConfig: boolean;
  seed: boolean;
  dbHostPort: string;
  dbName: string;
  dbUser: string;
  dbPass: string;
  jwtSecret: string;
  jwtAccessTokenExpiry: number;
  jwtRefreshTokenExpiry: number;
  key: string;
  salt: string;
  ip: string;
  host: string;
  port: number;
  protocol: string;
  clientProtocol: string;
  clientHost: string;
  clientPort: number;
}

const asciiArt = `
 ___      ___  ____    ___       ____     ___  _____ ______ 
|   \\    /  _]|    \\  /   \\     |    \\   /  _]/ ___/|      T
|    \\  /  [_ |  _  YY     Y    |  D  ) /  [_(   \\_ |      |
|  D  YY    _]|  |  ||  O  |    |    / Y    _]\\__  Tl_j  l_j
|     ||   [_ |  |  ||     |    |    \\ |   [_ /  \\ |  |  |  
|     ||     T|  |  |l     !    |  .  Y|     T\\    |  |  |  
l_____jl_____jl__j__j \\___/     l__j\\_jl_____j \\___j  l__j  
                                                            
`;
console.log(asciiArt);
console.log(
  bold(
    `Hi, Thanks for using Deno REST. Please answer following prompts to get started.`,
  ),
);

const configs: Configs = {
  name: "",
  useCurrentPath: true,
  path: "",
  seed: false,
  dbConfig: false,
  dbHostPort: "",
  dbName: "",
  dbUser: "",
  dbPass: "",
  jwtSecret: generatePass({
    type: "alphanumExt",
    number: 50,
    caps: true,
  }).pass,
  jwtAccessTokenExpiry: 3600,
  jwtRefreshTokenExpiry: 1800,
  key: generatePass({
    type: "alphanumExt",
    number: 25,
    caps: true,
  }).pass,
  salt: generatePass({
    type: "alphanumExt",
    number: 16,
    caps: true,
  }).pass,
  ip: "0.0.0.0",
  host: "localhost",
  port: 9000,
  protocol: "http",
  clientProtocol: "http",
  clientHost: "localhost",
  clientPort: 3000,
};
const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const ask = new Ask({
  prefix: ">",
});

const promptDirPath = async (): Promise<string> => {
  const { path } = await ask.input({
    name: "path",
    message: "Please enter path to generate project structure:",
    validate: (val?: any) => val.trim() !== "",
  });
  if (existsSync(path)) {
    const { override } = await ask.confirm({
      name: "override",
      message: red("Directory already exists, do you want to override?"),
    });
    if (!override) {
      return await promptDirPath();
    }
  }
  return path;
};

const setup = async () => {
  const { name } = await ask.input({
    name: "name",
    message: "What should be name of the project?",
    validate: (val?: any) => val.trim() !== "",
  });

  const { useCurrentPath } = await ask.confirm({
    name: "useCurrentPath",
    message: `Do you want to generate project structure in (${__dirname})?`,
  });

  if (!useCurrentPath) {
    configs.path = await promptDirPath();
  } else {
    configs.path = __dirname;
  }

  const { dbConfig } = await ask.confirm({
    name: "dbConfig",
    message:
      `Do you want to add local database configuration now? (You can skip this now and add later in your .env file)`,
  });

  if (dbConfig) {
    configs.seed = true;
    const { dbHostPort } = await ask.input({
      name: "dbHostPort",
      message: `Please enter database host and port (e.g. 127.0.0.1:27017)`,
      validate: (val?: any) => val.trim() !== "",
    });

    const { dbName } = await ask.input({
      name: "dbName",
      message: `Please enter database name`,
    });

    const { dbUser } = await ask.input({
      name: "dbUser",
      message: `Please enter database user (Leave blank if no user)`,
    });

    const { dbPass } = await ask.input({
      name: "dbPass",
      message: `Please enter database password (Leave blank if no password)`,
    });

    configs.dbHostPort = dbHostPort;
    configs.dbName = dbName;
    configs.dbUser = dbUser;
    configs.dbPass = dbPass;
  }

  configs.name = name;
  configs.useCurrentPath = useCurrentPath;
  configs.dbConfig = dbConfig;
};

const copyFiles = () => {
  console.log(`Generating project files in ${configs.path}...`);
  copySync(`${__dirname}/src`, configs.path, { overwrite: true });
};

const writeEnvFiles = async () => {
  let dbHostPort = "";
  let dbName = "";
  let dbUser = "";
  let dbPass = "";
  if (configs.dbConfig) {
    dbHostPort = configs.dbHostPort;
    dbName = configs.dbName;
    dbUser = configs.dbUser;
    dbPass = configs.dbPass;
  }
  const data = `APP_NAME=${configs.name}\n` +
    `JWT_SECRET=${configs.jwtSecret}\n` +
    `JWT_ACCESS_TOKEN_EXP=${configs.jwtAccessTokenExpiry}\n` +
    `JWT_REFRESH_TOKEN_EXP=${configs.jwtRefreshTokenExpiry}\n` +
    `KEY=${configs.key}\n` +
    `SALT=${configs.salt}\n` +
    `SEED=${configs.seed}\n` +
    `IP=${configs.ip}\n` +
    `HOST=${configs.host}\n` +
    `PORT=${configs.port}\n` +
    `PROTOCOL=${configs.protocol}\n` +
    `CLIENT_PROTOCOL=${configs.clientProtocol}\n` +
    `CLIENT_HOST=${configs.clientHost}\n` +
    `CLIENT_PORT=${configs.clientPort}\n` +
    `DB_HOST=${dbHostPort}\n` +
    `DB_NAME=${dbName}\n` +
    `DB_USER=${dbUser}\n` +
    `DB_PASS=${dbPass}\n`;

  await Deno.writeTextFile(`${configs.path}/.env/.env.development`, data);
};

const denoRest = async () => {
  await setup();
  copyFiles();
  await writeEnvFiles();

  console.log(bold(`Project structure is generated successfully!`));
  console.log(
    bold(
      green(
        `Please cd to ${configs.path} and use command 'denon start' to run the project`,
      ),
    ),
  );
};

await denoRest();
