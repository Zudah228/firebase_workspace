import { randomInt } from "crypto";
/**
 * ランダムな数字の文字列を生成
 * Math.random() は暗号には向かない
 *  * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *
 * Node.js 16.x Crypto を使用して生成
 *  * https://nodejs.org/docs/latest-v16.x/api/crypto.html
 *
 * @param {number} length - 数字の長さ
 * @return {string}
 */
export function generateRandomNumber(length: number): string {
  const num = randomInt(0, 10 ** length - 1);
  let zeroStr = "";
  for (let i = 1; i < length; i++) {
    zeroStr += "0";
  }
  return (zeroStr + `${num}`).slice(-1 * length);
}
