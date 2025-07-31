import { Injectable, UnauthorizedException } from "@nestjs/common";
import { either, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as jose from "jose";
import type { HttpRequest } from "src/lib/nest";
import { OIDCLoginDataType } from "$/auth/login/schema";
import { Scopes } from "$/auth/scopes";
import { AuthService } from "$/auth/service";
import { LMSRegisters } from "$/register/registers";
import { LTILaunchToken, LTILaunchTokenData } from "$/tokens/launch";
import { EnvVarsService } from "../config/env/env.service";
import type { AccessToken } from "./types";

@Injectable()
export class LtiService {
  private ltiAuthService: AuthService;

  constructor(
    private lmsRegisters: LMSRegisters,
    private env: EnvVarsService,
  ) {
    this.ltiAuthService = new AuthService(this.lmsRegisters, this.env.vars.lti.privateKey);
  }

  public async getAuthToken(ltiToken: LTILaunchTokenData): Promise<AccessToken> {
    const authToken = await this.ltiAuthService.getAuthToken(ltiToken, [
      Scopes.contextMembershipReadonly,
      Scopes.lineitemReadonly,
      Scopes.resultReadonly,
      Scopes.score,
    ]);

    return pipe(
      authToken,
      either.match(
        (error) => {
          throw error;
        },
        (value) => value,
      ),
    );
  }

  public async decodeAndVerifyIdToken(
    request: HttpRequest,
    _idToken: string,
  ): Promise<LTILaunchToken> {
    const idToken = jose.decodeJwt(_idToken) as jose.JWTPayload & {
      nonce: string;
    };

    return await pipe(
      option.fromNullable(request.session[idToken.nonce] as undefined | OIDCLoginDataType),
      option.match(
        () => {
          throw new UnauthorizedException();
        },
        (payload) =>
          pipe(
            async () => await this.ltiAuthService.decodeAndVerifyIdToken(payload, _idToken),
            taskEither.fromTask,
            taskEither.map(taskEither.fromEither),
            taskEither.flatten,
          ),
      ),
      taskEither.match(
        (error) => {
          throw error;
        },
        (token) => token,
      ),
    )();
  }
}
