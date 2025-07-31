import { either, taskEither, taskEither as te } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { ConfigurationError } from "$/errors/configuration-error";
import { UnauthorizedError } from "$/errors/unauthorized-error";
import { ValidationError } from "$/errors/validation-error";
import { LMSRegisters } from "$/register/registers";
import { LTILaunchToken, LTILaunchTokenData, LTILaunchTokenError } from "$/tokens/launch";
import { OIDCLoginDataType } from "../login/schema";
import { Scope } from "../scopes";
import { type __AuthToken, GetAuthToken } from "./get-auth-token";
import { VerifyAndValidateToken } from "./verify-and-validate-token";

export type AuthToken = __AuthToken;

export class AuthService {
  public constructor(
    private lmsRegisters: LMSRegisters,
    private ltiPrivateKey: string,
  ) {}

  public async getAuthToken(
    ltiToken: LTILaunchTokenData,
    scopes: Scope[],
  ): Promise<either.Either<ConfigurationError, AuthToken>> {
    return await pipe(
      this.lmsRegisters.get(
        ltiToken.tokenData.learningToolClientIdInsideLms,
        ltiToken.tokenData.lmsUrl,
      ),
      taskEither.fromOption(() => {
        const errMsg = "A LMS em questão não foi corretamente registrada nesta learning tool.";
        return new ConfigurationError(errMsg);
      }),
      taskEither.flatMap((register) =>
        taskEither.fromTask(
          async () =>
            await new GetAuthToken(ltiToken, register, this.ltiPrivateKey, scopes).exec(),
        ),
      ),
    )();
  }

  public async decodeAndVerifyIdToken(
    loginPayload: OIDCLoginDataType,
    idToken: string,
  ): Promise<
    either.Either<
      ConfigurationError | UnauthorizedError | ValidationError<LTILaunchTokenError>,
      LTILaunchToken
    >
  > {
    const verifyToken = new VerifyAndValidateToken(this.lmsRegisters, loginPayload, idToken);
    const tokenValidation = await pipe(
      verifyToken.exec(),
      te.map(LTILaunchToken.fromIdToken),
      te.map((token) =>
        pipe(
          token,
          either.mapLeft(
            (err) => new ValidationError("O token fornecido está num formato inválido", err),
          ),
        ),
      ),
    )();
    return either.flattenW(tokenValidation);
  }
}
