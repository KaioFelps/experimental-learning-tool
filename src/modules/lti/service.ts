import { Injectable, UnauthorizedException } from "@nestjs/common";
import { either, option } from "fp-ts";
import * as jose from "jose";
import type { HttpRequest } from "src/lib/nest";
import { EnvVarsService } from "../config/env/env.service";
import type { OIDCLoginType } from "./dtos/login-request";
import { LmsRegisters } from "./lms-registers";
import { LtiTokenData } from "./lti-token";
import type { AccessToken } from "./types";

@Injectable()
export class LtiService {
  constructor(
    private lmsRegisters: LmsRegisters,
    private env: EnvVarsService,
  ) {}

  public async decodeAndVerifyIdToken(request: HttpRequest, idToken: string) {
    const token = await this.getVerifiedTokenPayloadOrThrow(request, idToken);

    const _ltiTokenData = LtiTokenData.fromLtiIdToken(token);

    if (either.isLeft(_ltiTokenData))
      throw new UnauthorizedException(_ltiTokenData.left);

    return _ltiTokenData.right;
  }

  public async getAuthToken(ltiToken: LtiTokenData): Promise<AccessToken> {
    const now = Math.floor(Date.now() / 1000);

    const loginJwtToken = await new jose.SignJWT({
      iss: ltiToken.tokenData.learningToolClientIdInsideLms,
      sub: ltiToken.tokenData.learningToolClientIdInsideLms,
      aud: this.env.vars.lti.tokenEndpoint,
      iat: now,
      exp: now + 300,
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: "RS256" })
      .sign(await jose.importPKCS8(this.env.vars.lti.privateKey, "RS256"));

    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: ltiToken.tokenData.learningToolClientIdInsideLms,
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: loginJwtToken,
      scope:
        "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly \
        https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly \
        https://purl.imsglobal.org/spec/lti-ags/scope/score \
        https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly",
    });

    const authResponse = await fetch(this.env.vars.lti.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const token: {
      access_token: string;
      token_type: string;
      expires_in: number;
      scope: string;
    } = await authResponse.json();

    return {
      expiresIn: token.expires_in,
      scopes: token.scope.split(" "),
      token: token.access_token,
    } satisfies AccessToken;
  }

  private async getVerifiedTokenPayloadOrThrow(
    request: HttpRequest,
    idToken: string,
  ): Promise<jose.JWTPayload> {
    const header = JSON.parse(
      Buffer.from(idToken.split(".")[0], "base64url").toString(),
    );

    const _signingKey = await this.lmsRegisters.keys().get(header.kid!);

    const token = jose.decodeJwt(idToken) as jose.JWTPayload & {
      nonce: string;
    };

    const payload = request.session[token.nonce] as undefined | OIDCLoginType;

    if (option.isNone(_signingKey) || !payload) {
      throw new UnauthorizedException();
    }

    const signingKey = _signingKey.value;

    const key = await jose.importJWK(signingKey, signingKey.alg);

    const verifiedToken = await jose.jwtVerify(idToken, key, {
      algorithms: [signingKey.alg],
      audience: payload.client_id,
      issuer: payload.iss,
    });

    return verifiedToken.payload;
  }
}
