export class Bm25Search {
  private _documents: Array<string>;

  constructor() {
    this._documents = [];
  }

  addDocuments(documents: string[]): void {
    throw new Error("Not implemented");
  }

  search(query: string): string {
    throw new Error("Not implemented");
  }
}
