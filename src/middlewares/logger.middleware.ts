import { handlers, getLogger, setup } from "../deps.ts";
import configs from "../config/config.ts";

const { env } = configs;

await setup({
  handlers: {
    functionFmt: new handlers.ConsoleHandler("DEBUG", {
      formatter: (logRecord) => {
        let time = new Date().toISOString();
        let msg = `${time} [${logRecord.level}] ${logRecord.msg}`;

        logRecord.args.forEach((arg, index) => {
          msg += `, arg${index}: ${arg}`;
        });
        return msg;
      },
    }),
  },

  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["functionFmt"],
    },
    tests: {
      level: "CRITICAL",
      handlers: ["functionFmt"],
    },
  },
});

let loggerMiddleware = getLogger();

if (env === "test") {
  loggerMiddleware = getLogger("tests");
}

export default loggerMiddleware;
