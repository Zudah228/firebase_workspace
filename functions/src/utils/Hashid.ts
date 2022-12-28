import Hashids from "hashids/cjs/hashids";
import * as uuid from "uuid";

/**
 * ランダムな文字列の生成
 * バックグラウンド関数では、冪等性を担保する必要があるため、推奨しない。
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
