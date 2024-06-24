import { Tokenizer } from "./Tokenizer";

export namespace Bm25Search {
  export type Document = string;
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
  private _documents: Array<Bm25Search.Document>;
  private invertedIndex: Map<string, number[]> = new Map();

  // Internal tools
  private _tokenizer;

  constructor(config: Bm25Search.Config = { method: "lucene" }) {
    this._documents = [];
    this._method = config.method;
    this._tokenizer = new Tokenizer();
  }

  addDocuments(documents: Bm25Search.Document[]): void {
    // First, add the raw documents to the internal list
    this._documents.push(...documents);

    // Next, preprocess the documents
    for (const document of documents) {
      const terms = this._tokenizer.tokenize(document);
    }
  }

  search(query: string): Bm25Search.Document[] {
    throw new Error("Not implemented");
  }
}
