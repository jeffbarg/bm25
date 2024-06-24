import { Bm25Search } from "../src/index";

describe("Bm25Search module", () => {
  test("constructor should not throw an error", () => {
    const bm25 = new Bm25Search();
    expect(bm25).toBeInstanceOf(Bm25Search);
  });

  test("addDocuments should throw an error", () => {
    const bm25 = new Bm25Search();
    expect(() => bm25.addDocuments([])).not.toThrow();
    expect(() => bm25.addDocuments(["document 1", "document 2", "document 3"])).not.toThrow();
  });
});
