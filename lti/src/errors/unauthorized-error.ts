import { constants } from "node:http2";
import { LTIError } from "./lti-error";

export class UnauthorizedError extends LTIError {
  public constructor(message: string) {
    super(constants.HTTP_STATUS_UNAUTHORIZED, message);
  }
}
