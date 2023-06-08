import * as CryptoJS from 'crypto-js';
import { TOKEN_AES } from './keys';

export class EncryptionAES {

  constructor() { }

  static encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), TOKEN_AES).toString();
  }

  static decrypt(data) {
    const bytes = CryptoJS.AES.decrypt(data, TOKEN_AES);
    try {
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      return bytes.toString(CryptoJS.enc.Utf8);
    }
  }
}
