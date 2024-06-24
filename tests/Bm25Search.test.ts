import { Bm25Search } from "../src/index";

describe("Bm25Search module", () => {
  test("constructor should not throw an error", () => {
    const search = new Bm25Search();
    expect(search).toBeInstanceOf(Bm25Search);
  });
});
