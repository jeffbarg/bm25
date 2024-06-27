import { Bm25Search } from "../src/index";

describe("Bm25Search module", () => {
  test("constructor should not throw an error", () => {
    const bm25 = new Bm25Search("id");
    expect(bm25).toBeInstanceOf(Bm25Search);
  });

  test("addDocuments with objects should not throw an error", () => {
    const bm25 = new Bm25Search("id");
    expect(() => bm25.addDocuments([])).not.toThrow();
    expect(() =>
      bm25.addDocuments([{ name: "document 1" }, { name: "document 2" }, { name: "document 3" }])
    ).not.toThrow();
  });

  test("Search should correctly score documents", () => {
    const documents = [
      { id: "1", name: "Shane" },
      { id: "2", name: "Shane C" },
      { id: "3", name: "Shane P Connelly" },
      { id: "4", name: "Shane Connelly" },
      { id: "5", name: "Shane Shane Connelly Connelly" },
      { id: "6", name: "Shane Shane Shane Connelly Connelly Connelly" },
    ];

    const bm25 = new Bm25Search("id", {
      constants: {
        b: 1.0,
        k1: 5.0,
      },
    });

    bm25.addIndex("name");
    bm25.addDocuments(documents);
    const results = bm25.search("Shane");

    const expectedResults = new Set([
      { document: documents[0], score: 0.16674293734587414 },
      { document: documents[1], score: 0.10261103836669179 },
      { document: documents[3], score: 0.10261103836669179 },
      { document: documents[4], score: 0.10261103836669179 },
      { document: documents[5], score: 0.10261103836669178 },
      { document: documents[2], score: 0.07410797215372183 },
    ]);

    expect(results).toHaveLength(expectedResults.size);

    // Check that the results are the same
    expect(expectedResults).toEqual(new Set(results));
  });
});
