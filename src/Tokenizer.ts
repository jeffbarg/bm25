export namespace Tokenizer {}

export class Tokenizer {
  tokenize(value: string): string[] {
    return value.split(" "); // Most basic tokenization
  }
}
