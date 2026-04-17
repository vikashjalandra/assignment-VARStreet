export type ErrorDetails = Record<string, string>;

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly errors: ErrorDetails | undefined;

  constructor(statusCode: number, message: string, errors?: ErrorDetails) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}