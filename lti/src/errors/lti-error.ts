export class LTIError extends Error {
  public constructor(
    public readonly status: number,
    message?: string,
  ) {
    super(message);
  }
}
