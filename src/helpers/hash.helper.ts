import configs from "../config/config.ts";
import { AES, encode } from "../deps.ts";

class HashHelper {
  private static key: string = configs.key;
  private static salt: string = configs.salt;

  private static aes(): AES {
    return new AES(this.key, { mode: "cbc", iv: this.salt });
  }

  /**
   * Encrypts plain string and returns cipher in hex
   * @param str
   * @returns Promise<string> Returns encrypted cipher in hex format
   */
  public static async encrypt(str: string): Promise<string> {
    const cipher = await this.aes().encrypt(str);
    return cipher.hex();
  }

  /**
   * Decrypts AES hex and returns plain string
   * @param str
   * @returns Promise<string> Returns decrypted cipher in plain string format
   */
  public static async decrypt(str: string): Promise<string> {
    const plain = await this.aes().decrypt(encode.hex(str));
    return plain.toString();
  }

  /**
   * Compares encrypted and provided string
   * @param plain
   * @param encrypted
   * @returns Promise<boolean> Returns Boolean if provided string and encrypted string are equal
   */
  public static async compare(
    plain: string,
    encrypted: string,
  ): Promise<boolean> {
    return await this.encrypt(plain) === encrypted;
  }
}

export default HashHelper;
