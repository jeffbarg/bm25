import { Tokenizer } from "./Tokenizer";

export namespace Bm25Search {
  export type Document = string;
  export interface Config {
    constants?: {
      k1?: number;
      b?: number;
      delta?: number;
    };
  }
}

/**
 * BM25 search implementation.
 *
 * This class provides a simple implementation of the BM25 search algorithm.
 *
 * @see {@link https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables} for a good walkthrough of BM25.
 */
export class Bm25Search {
  // Configuration Constants
  private _k1 = 1.5;
  private _b = 0.75;
  private _delta = 0.5;

  // Raw data
  private _documents: Bm25Search.Document[];

  // Index and statistics
  private _invertedIndex: Map<string, number[]> = new Map();
  private _documentLengths = new Map<number, { length: number }>();
  private _averageDocumentLength = Number.NaN;

  // Internal tools
  private _tokenizer;

  constructor(config: Bm25Search.Config = {}) {
    this._documents = [];
    this._tokenizer = new Tokenizer();

    // If the constants are provided, use them
    if (config.constants) {
      this._k1 = config.constants.k1 !== undefined ? config.constants.k1 : this._k1;
      this._b = config.constants.b !== undefined ? config.constants.b : this._b;
      this._delta = config.constants.delta !== undefined ? config.constants.delta : this._delta;
    }
  }

  addDocuments(documents: Bm25Search.Document[]): void {
    // First, add the raw documents to the internal list
    this._documents.push(...documents);

    // Compute the term frequency
    this._recomputeIndex();
  }

  private _recomputeIndex(): void {
    // Reset the inverted index
    const invertedIndex = new Map();
    const documentLengths = new Map<number, { length: number }>(); // This is a map of the document ID to the document length (in tokens)

    // Next, process the documents
    const documents = this._documents;
    let documentLengthSum = 0; // This is the sum of the document lengths (in tokens). We will use this to compute the average document length

    for (const [index, document] of documents.entries()) {
      const documentId = index; // For now, we'll use the index as the document ID

      // Tokenize the document
      const terms = this._tokenizer.tokenize(document);

      // Compute the document length
      documentLengths.set(documentId, { length: terms.length });
      documentLengthSum += terms.length;

      // Add the terms to the inverted index
      for (const term of terms) {
        if (!invertedIndex.has(term)) {
          invertedIndex.set(term, []);
        }
        invertedIndex.get(term)?.push(documentId);
      }
    }

    // Update the inverted index and associated statistics
    this._invertedIndex = invertedIndex;
    this._documentLengths = documentLengths;
    this._averageDocumentLength = documentLengthSum / documents.length;
  }

  _computeIdf(term: string): number {
    const documentsCount = this._documents.length;
    const termFrequency = new Set(this._invertedIndex.get(term)).size; // TODO: Optimize this by precomputing the set of document IDs for each term at index time.

    // Use the formula from the BM25 paper
    return Math.log((documentsCount - termFrequency + 0.5) / (termFrequency + 0.5));
  }

  search(query: string): { document: Bm25Search.Document; score: number }[] {
    // Preprocess the query (tokenize, remove stopwords, etc.)
    const queryTerms = this._tokenizer.tokenize(query);

    // For each document, calculate the BM25 score. `documentScores` will be a map of document ID to BM25 score
    // Since the document ID is the same as the index in the `_documents` array, we can use the index as the document ID by using `.map` as a hack for now.
    const documentScores: { documentId: number; score: number }[] = this._documents.map((document, index) => {
      const documentId = index;
      const documentLength = this._documentLengths.get(documentId)?.length ?? 0;

      // For each query term, calculate the BM25 score contribution
      const queryScoreParts = queryTerms.map((term) => {
        // Calculate the BM25 score contribution

        // idf(qi) is the inverse document frequency for the ith query term
        const idf_qi = this._computeIdf(term);

        // f(qi,D) is “how many times does the ith query term occur in document D?”
        const f_qi_d = this._invertedIndex.get(term)?.filter((docId) => docId === documentId).length ?? 0;

        const numerator = f_qi_d * (this._k1 + 1);
        const denominator =
          f_qi_d + this._k1 * (1 - this._b + this._b * (documentLength / this._averageDocumentLength));

        const queryTermScore = idf_qi * (numerator / denominator);

        return queryTermScore;
      });

      // Sum the scores for each query term to get the total BM25 score for the document
      const documentScore = queryScoreParts.reduce((acc, score) => acc + score, 0.0);

      // Return the document ID and the total BM25 score pair
      return { documentId, score: documentScore };
    });

    // Return the documents in the order of their BM25 scores
    return (
      documentScores
        // .filter((documentScorePair) => documentScorePair.score > 0.0)
        .sort((a, b) => b.score - a.score)
        .reverse()
        .map((documentScorePair) => ({
          document: this._documents[documentScorePair.documentId],
          score: documentScorePair.score,
        }))
    );
  }
}
