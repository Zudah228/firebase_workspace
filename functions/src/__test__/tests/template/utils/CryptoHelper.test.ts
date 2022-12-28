import { CryptoHelper } from "../../../../utils/CryptoHelper";

describe("CryptoHelper のテスト", () => {
  test("正しい長さで生成できている", () => {
    const length = 8;
    const randomNumber = CryptoHelper.generateRandomNumber(length);
    expect(randomNumber.length).toEqual(length);
  });
});
