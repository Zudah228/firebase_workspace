type QueryParam = string | qs.ParsedQs | string[] | qs.ParsedQs[] | undefined;

/**
 * Http のクエリを、JavaScript のプリミティブに変換する Helper クラス
 */
export class HttpQueryHelper {
  /**
   * クエリを string に変換
   * @param {QueryParam}  queryParam - クエリ
   * @return {string | undefined} - string 以外を undefined で返す
   */
  parseStringOrUndefined(queryParam: QueryParam): string | undefined {
    if (typeof queryParam !== "string") {
      return undefined;
    }
    if (queryParam === "undefined") {
      return undefined;
    }
    if (queryParam === "null") {
      return undefined;
    }
    return queryParam;
  }

  /**
   * クエリを number に変換
   * @param {QueryParam}  queryParam - クエリ
   * @return {number | undefined} - number 以外を undefined で返す
   */
  parseNumberOrUndefined(queryParam: QueryParam): number | undefined {
    const parsedStr = this.parseStringOrUndefined(queryParam);
    if (parsedStr === undefined) {
      return undefined;
    }
    const num = parseInt(parsedStr);
    return isNaN(num) ? undefined : num;
  }

  /**
   * クエリを boolean に変換。boolean ではない場合は、強制的に false にする。
   * @param {QueryParam}  queryParam - クエリ
   * @return {boolean} - boolean 以外は false
   */
  parseBoolean(queryParam: QueryParam): boolean {
    const parsedStr = this.parseStringOrUndefined(queryParam);
    if (parsedStr === "true") {
      return true;
    }

    if (parsedStr === "false" || parsedStr === undefined) {
      return false;
    }
    return false;
  }

  /**
   * クエリを boolean に変換。boolean ではない場合は、undefined を返す。
   * @param {QueryParam}  queryParam - クエリ
   * @return {boolean | undefined} - boolean 以外は false
   */
  parseBooleanOrUndefined(queryParam: QueryParam): boolean | undefined {
    const parsedStr = this.parseStringOrUndefined(queryParam);
    if (parsedStr === "true") {
      return true;
    }

    if (parsedStr === "false") {
      return false;
    }
    return false;
  }
}
