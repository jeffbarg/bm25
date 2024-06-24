import type { Bm25Search } from "./Bm25Search";

export namespace Tokenizer {}

export class Tokenizer {
  tokenize(document: Bm25Search.Document): string[] {
    return document.split(" "); // Most basic tokenization
  }
}
