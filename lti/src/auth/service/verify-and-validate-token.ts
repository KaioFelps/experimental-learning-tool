import { taskEither as te } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as jose from "jose";
import { ConfigurationError } from "lti/src/errors/configuration-error";
import { UnauthorizedError } from "lti/src/errors/unauthorized-error";
import { Key } from "lti/src/register/keys-set";
import { LMSRegisters } from "lti/src/register/registers";
import { OIDCLoginDataType } from "../login/schema";

export class VerifyAndValidateToken {
  public constructor(
    private lmsRegisters: LMSRegisters,
    private loginPayload: OIDCLoginDataType,
    private idToken: string,
  ) {}

  public exec(): te.TaskEither<ConfigurationError | UnauthorizedError, jose.JWTPayload> {
    const header = JSON.parse(Buffer.from(this.idToken.split(".")[0], "base64url").toString());

    return pipe(
      this.getKeys(header),
      te.flatMap(([signingKey, cryptoKey]) => this.tryVerifyToken(signingKey, cryptoKey)),
    );
  }

  private tryVerifyToken(signingKey: Key, cryptoKey: CryptoKey | Uint8Array<ArrayBufferLike>) {
    return pipe(
      te.tryCatch(
        async () =>
          await jose.jwtVerify(this.idToken, cryptoKey, {
            algorithms: [signingKey.alg],
            audience: this.loginPayload.client_id,
            issuer: this.loginPayload.iss,
          }),
        () => new UnauthorizedError("O token fornecido não contém uma assinatura válida."),
      ),
      te.map((token) => token.payload),
    );
  }

  private getKeys(header: { kid: string }) {
    return pipe(
      this.lmsRegisters.get(this.loginPayload.client_id, this.loginPayload.iss),
      te.fromOption(
        () => new ConfigurationError("A LMS não foi registrada nesta learning tool"),
      ),
      te.flatMap((register) =>
        te.fromTask(async () => await register.keysSet.get(header.kid)),
      ),
      te.flatMap(
        te.fromOption(
          () =>
            new ConfigurationError("A chave especificada no token não foi encontrada na LMS."),
        ),
      ),
      te.flatMap((signingKey) =>
        te.fromTask(
          async () => [signingKey, await jose.importJWK(signingKey, signingKey.alg)] as const,
        ),
      ),
    );
  }
}
