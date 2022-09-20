/**
 * Typescript の基本機能を補うための utility
 */

import Hashids from "hashids/cjs/hashids";
import * as uuid from "uuid";

/**
 * null と undefined のチェック
 * @param {unknown} x
 * @return {boolean}
 */
export function isNull(x: unknown): x is null | undefined {
  return x === undefined || x === null;
}

/**
 * ランダムな文字列の生成
 *
 * @param {"short" | "long"} type
 * @returns {string}
 */
export function getHashid(type: "short" | "long" = "short"): string {
  const password = uuid.v4();
  const hashid = new Hashids(password);
  if (type === "long") {
    return hashid.encode(1, 2, 3, 4);
  } else {
    return hashid.encode(1, 2, 3);
  }
}
