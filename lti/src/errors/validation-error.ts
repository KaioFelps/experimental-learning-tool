import { constants } from "node:http2";
import { LTIError } from "./lti-error";

export class ValidationError<E = undefined> extends LTIError {
  public readonly errors?: E;

  public constructor(message: string, errors?: E) {
    super(constants.HTTP_STATUS_BAD_REQUEST, message);
    this.errors = errors;
  }
}
