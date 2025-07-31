import { either, option } from "fp-ts";
import { LMSRegisters } from "lti/src/register/registers";
import { OIDCRedirect } from "../redirect";
import { type OIDCLoginDataType, type OIDCLoginError, oidcLoginSchema } from "./schema";

export class OIDCLoginToken {
  private constructor(public readonly payload: OIDCLoginDataType) {}

  public static tryFromObject(body: object): either.Either<OIDCLoginError, OIDCLoginToken> {
    const { success, data, error } = oidcLoginSchema.safeParse(body);
    if (!success) return either.left(error);
    return either.right(new OIDCLoginToken(data));
  }

  public intoOIDCRedirect(lmsRegisters: LMSRegisters): option.Option<OIDCRedirect> {
    return OIDCRedirect.fromLMSRegisters(this.payload, lmsRegisters);
  }
}
