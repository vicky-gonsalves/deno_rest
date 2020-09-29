import { MongoClient } from "../deps.ts";
import configs from "../config/config.ts";
import log from "../middlewares/logger.middleware.ts";
import Seed from "../seed.ts";

const { dbName, mongoUrl, seed } = configs;

/**
 * Reusable database connection
 */
class Database {
  public client: MongoClient;
  private seeder: Seed = new Seed();

  /**
   * Constructor function for Database
   * @param dbName
   * @param url
   */
  constructor(public dbName: string, public url: string) {
    this.dbName = dbName;
    this.url = url;
    this.client = {} as MongoClient;
  }

  /**
   * Function to connect to mongo db
   */
  connect() {
    log.info("Database connecting...");
    const client: MongoClient = new MongoClient();
    client.connectWithUri(this.url);
    this.client = client;
    log.info("Database connected!");
    if (seed) {
      const ev = setTimeout(async () => {
        await this.seeder.seedCollection();
        log.info("All Seed done");
        clearTimeout(ev);
      }, 10);
    }
  }

  /**
   * returns database
   */
  get getDatabase() {
    return this.client.database(this.dbName);
  }
}

const db = new Database(dbName, mongoUrl);
db.connect();

export default db;
