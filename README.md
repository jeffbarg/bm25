# Overview

This is a pure typescript implementation of the BM25 retrieval algorithm with no runtime dependencies.

The package exports a class BM25Search, which has two primary methods:

- `.addDocuments` which creates an inverted term-frequency index and computes relevant statistics about the documents
- `.search` which returns relevant documents based on a search term.

This API is based loosely off of the `js-search` package.

## BM25 Architecture

```mermaid
graph LR
    subgraph "Document Ingestion Process"
    A1[Start Ingestion] --> B1[Ingest Documents]
    B1 --> C1[Create Inverted Index]
    C1 --> D1[Calculate Document Lengths]
    D1 --> E1[Compute Collection Statistics]
    E1 --> F1[Precompute IDF Values]
    F1 --> G1[Index Ready]
    end

    subgraph "Search Process"
    A2[Start Search] --> H2[Receive Search Query]
    H2 --> I2[Tokenize Query]
    I2 --> J2[For Each Query Term]
    J2 --> K2{Term in Index?}
    K2 -->|Yes| L2[Retrieve Posting List]
    K2 -->|No| M2[Skip Term]
    L2 --> N2[Calculate BM25 Score for Each Document]
    N2 --> O2[Accumulate Scores]
    O2 --> P2{More Terms?}
    P2 -->|Yes| J2
    P2 -->|No| Q2[Sort Documents by Score]
    Q2 --> R2[Return Top K Results]
    R2 --> S2[End Search]
    end

    G1 -.-> H2

    linkStyle default orthogonal
```

# Prior Art

This is heavily influenced by the [`BM25S` project](https://github.com/xhluca/bm25s) in Python.

# Citations

TODO
