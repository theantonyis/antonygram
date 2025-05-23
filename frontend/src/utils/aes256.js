import CryptoJS from "crypto-js";

const KEY = process.env.NEXT_PUBLIC_AES_KEY;
const IV = process.env.NEXT_PUBLIC_AES_IV;

export function encrypt(text) {
  const key = CryptoJS.enc.Utf8.parse(KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV);
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv, mode: CryptoJS.mode.CBC });
  return encrypted.toString(); // Base64
}

export function decrypt(ciphertext) {
  const key = CryptoJS.enc.Utf8.parse(KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV);
  const bytes = CryptoJS.AES.decrypt(ciphertext, key, { iv, mode: CryptoJS.mode.CBC });
  return bytes.toString(CryptoJS.enc.Utf8);
}

