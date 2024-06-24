export namespace Bm25Search {
  export type ImplementationType = "lucene"; // More types can be added here
  export interface Config {
    method: ImplementationType;
  }
}

export class Bm25Search {
  // Constants
  private _k1 = 1.5;
  private _b = 0.75;
  private _delta = 0.5;

  // Configuration
  private _method = "lucene";

  // Raw data
  private _documents: Array<string>;

  constructor(config: Bm25Search.Config = { method: "lucene" }) {
    this._documents = [];
    this._method = config.method;
  }

  addDocuments(documents: string[]): void {
    this._documents.push(...documents);
  }

  search(query: string): string[] {
    throw new Error("Not implemented");
  }
}
