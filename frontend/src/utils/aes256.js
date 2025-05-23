import CryptoJS from "crypto-js";

const KEY = process.env.NEXT_PUBLIC_AES_KEY;
const IV = process.env.NEXT_PUBLIC_AES_IV;

if (!KEY || !IV) {
  throw new Error("AES KEY or IV is not set in environment variables.");
}

export function encrypt(text) {
  const key = CryptoJS.enc.Hex.parse(KEY);
  const iv = CryptoJS.enc.Hex.parse(IV);
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv, mode: CryptoJS.mode.CBC });
  return encrypted.toString();
}

export function decrypt(ciphertext) {
  const key = CryptoJS.enc.Hex.parse(KEY);
  const iv = CryptoJS.enc.Hex.parse(IV);
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, { iv, mode: CryptoJS.mode.CBC });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
