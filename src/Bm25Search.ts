import { Tokenizer } from "./Tokenizer";

export namespace Bm25Search {
  export interface Config {
    constants?: {
      k1?: number;
      b?: number;
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
export class Bm25Search<Document extends Record<string, string>, DocumentIdKey extends keyof Document> {
  // Configuration Constants
  private _k1 = 1.5;
  private _b = 0.75;

  // Raw data
  private _idFieldName: DocumentIdKey;
  private _documents: Map<Document[DocumentIdKey], Document>;
  private _indices: Array<keyof Document> = []; // This is the list of fields that we will index

  // Index and statistics
  private _invertedIndex: Map<string, Array<Document[DocumentIdKey]>> = new Map(); // This is a map of terms to the document IDs that contain that term.
  private _documentLengths = new Map<Document[DocumentIdKey], { length: number }>();
  private _averageDocumentLength = Number.NaN;

  // Internal tools
  private _tokenizer;

  constructor(idFieldName: DocumentIdKey, config: Bm25Search.Config = {}) {
    this._documents = new Map();
    this._tokenizer = new Tokenizer();
    this._indices = new Array<keyof Document>();

    // Set the ID field name
    this._idFieldName = idFieldName;

    // If the constants are provided, use them
    if (config.constants) {
      this._k1 = config.constants.k1 !== undefined ? config.constants.k1 : this._k1;
      this._b = config.constants.b !== undefined ? config.constants.b : this._b;
    }
  }

  /**
   * Add a field to the index for future documents.
   *
   * @param indexedFieldKey the key of the field to index
   */
  addIndex(indexedFieldKey: keyof Document): void {
    this._indices.push(indexedFieldKey);
  }

  addDocuments(documents: Document[]): void {
    // First, add the raw documents to the internal list
    for (const document of documents) {
      const documentId = document[this._idFieldName];
      this._documents.set(documentId, document);
    }

    // Compute the term frequency
    this._recomputeIndex();
  }

  private _recomputeIndex(): void {
    // Reset the inverted index
    const invertedIndex = new Map();
    const documentLengths = new Map<Document[DocumentIdKey], { length: number }>(); // This is a map of the document ID to the document length (in tokens)

    // Next, process the documents
    const documents = this._documents;
    let documentLengthSum = 0; // This is the sum of the document lengths (in tokens). We will use this to compute the average document length

    for (const [index, document] of documents.entries()) {
      const documentId = document[this._idFieldName]; // For now, we'll use the index as the document ID

      // Tokenize the document
      const terms = this._indices.flatMap((indexedFieldKey) => this._tokenizer.tokenize(document[indexedFieldKey]));

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
    this._averageDocumentLength = documentLengthSum / documents.size;
  }

  _computeIdf(term: string): number {
    const documentsCount = this._documents.size;
    const termFrequency = new Set(this._invertedIndex.get(term)).size; // TODO: Optimize this by precomputing the set of document IDs for each term at index time.

    // Use the formula from the BM25 paper
    return Math.log(1 + (documentsCount - termFrequency + 0.5) / (termFrequency + 0.5));
  }

  search(query: string): { document: Document; score: number }[] {
    // Preprocess the query (tokenize, remove stopwords, etc.)
    const queryTerms = this._tokenizer.tokenize(query);

    // For each document, calculate the BM25 score. `documentScores` will be a map of document ID to BM25 score
    // Since the document ID is the same as the index in the `_documents` array, we can use the index as the document ID by using `.map` as a hack for now.
    const scoredDocuments: { document: Document; score: number }[] = [];
    for (const [documentId, document] of this._documents.entries()) {
      // Get the length of the document from cache
      const documentLength = this._documentLengths.get(documentId)?.length ?? 0;

      // For each query term, calculate the BM25 score contribution
      const queryScoreParts = queryTerms.map((term) => {
        // Calculate the BM25 score contribution

        // idf(qi) is the inverse document frequency for the ith query term
        const idf_qi = this._computeIdf(term);

        // f(qi,D) is “how many times does the ith query term occur in document D?”
        const f_qi_d = this._invertedIndex.get(term)?.filter((docId) => docId === documentId).length ?? 0;
        console.log("f_qi_d", documentId, term, f_qi_d);

        const numerator = f_qi_d * (this._k1 + 1);
        const denominator =
          f_qi_d + this._k1 * (1 - this._b + this._b * (documentLength / this._averageDocumentLength));

        const queryTermScore = idf_qi * (numerator / denominator);

        return queryTermScore;
      });

      // Sum the scores for each query term to get the total BM25 score for the document
      const documentScore = queryScoreParts.reduce((acc, score) => acc + score, 0.0);

      // Return the document ID and the total BM25 score pair
      scoredDocuments.push({ document, score: documentScore });
    }

    // Return the documents in the order of their BM25 scores
    return (
      scoredDocuments
        // .filter((documentScorePair) => documentScorePair.score > 0.0)
        .sort((a, b) => b.score - a.score) // Sort by descending score
        .map((documentScorePair) => ({
          document: documentScorePair.document,
          score: documentScorePair.score,
        }))
    );
  }
}
