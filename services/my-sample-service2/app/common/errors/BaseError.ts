export class BaseError extends Error {
  code: string;
  constructor(message: string) {
    super(message);
    this.code = this.constructor.name;
  }
}
