export namespace Tokenizer {}

export class Tokenizer {
  // biome-ignore lint/complexity/noBannedTypes: We need to use `Object` here to allow for any type of input that can be converted to a string.
  tokenize(value: Object): string[] {
    const stringValue = value.toString();
    return stringValue.split(" "); // Most basic tokenization
  }
}
