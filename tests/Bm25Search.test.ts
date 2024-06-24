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

  test("Search should correctly score documents", () => {
    const documents = [
      "Shane",
      "Shane C",
      "Shane P Connelly",
      "Shane Connelly",
      "Shane Shane Connelly Connelly",
      "Shane Shane Shane Connelly Connelly Connelly",
    ];

    const bm25 = new Bm25Search({
      constants: {
        b: 1.0,
        k1: 5.0,
      },
    });

    bm25.addDocuments(documents);
    const results = bm25.search("Shane");

    const expectedResults = [
      { document: "Shane", score: 0.16674294 },
      { document: "Shane C", score: 0.102611035 },
      { document: "Shane Connelly", score: 0.102611035 },
      { document: "Shane Shane Connelly Connelly", score: 0.102611035 },
      { document: "Shane Shane Shane Connelly Connelly Connelly", score: 0.10261105 },
      { document: "Shane P Connelly", score: 0.074107975 },
    ];

    expect(results).toHaveLength(expectedResults.length);
    expectedResults.forEach((expected, index) => {
      expect(results[index].document).toBe(expected.document);
      expect(results[index].score).toBeCloseTo(expected.score, 5);
    });
  });
});
