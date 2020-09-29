import { dotEnv } from "../deps.ts";

const env: string = Deno.env.toObject().ENV || "test";
const envPath: string = `.env/.env.${env}`.toString();
const envConfig = dotEnv({
  path: envPath,
});

let mongoUrl = `mongodb://${envConfig.DB_USER}:${
  encodeURIComponent(envConfig.DB_PASS)
}@${envConfig.DB_HOST}/${envConfig.DB_NAME}`;

if (env === "development" || env === "test") {
  if (envConfig.DB_USER === "" && envConfig.DB_PASS === "") {
    mongoUrl = `mongodb://${envConfig.DB_HOST}/${envConfig.DB_NAME}`;
  }
}

/**
 * Configuration
 */
const config: ({
  env: string;
  appName: string;
  key: string;
  jwtSecret: string;
  jwtAccessExpiration: number;
  jwtRefreshExpiration: number;
  salt: string;
  ip: string;
  host: string;
  port: number;
  protocol: string;
  mongoUrl: string;
  dbName: string;
  seed: boolean;
  clientHost: string;
  clientPort: number;
  clientProtocol: string;
  url: string;
  clientUrl: string;
}) = {
  env,
  appName: envConfig.APP_NAME,
  key: envConfig.KEY,
  jwtSecret: envConfig.JWT_SECRET,
  jwtAccessExpiration: Number(envConfig.JWT_ACCESS_TOKEN_EXP),
  jwtRefreshExpiration: Number(envConfig.JWT_REFRESH_TOKEN_EXP),
  salt: envConfig.SALT,
  ip: envConfig.IP,
  host: envConfig.HOST,
  port: Number(envConfig.PORT),
  protocol: envConfig.PROTOCOL,
  mongoUrl,
  dbName: envConfig.DB_NAME,
  seed: Boolean(envConfig.SEED === "true"),
  clientHost: envConfig.CLIENT_HOST,
  clientPort: Number(envConfig.CLIENT_PORT),
  clientProtocol: envConfig.CLIENT_PROTOCOL,
  url: `${envConfig.PROTOCOL}://${envConfig.HOST}:${envConfig.PORT}`,
  clientUrl:
    `${envConfig.CLIENT_PROTOCOL}://${envConfig.CLIENT_HOST}:${envConfig.CLIENT_PORT}`,
};

export default config;
