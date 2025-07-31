import * as jose from "jose";
import { LMSRegisterData } from "$/register/registers";
import { LTILaunchTokenData } from "$/tokens/launch";
import { Scope } from "../scopes";

type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

export type __AuthToken = {
  token: string;
  expiresIn: number;
  scopes: string[];
};

export class GetAuthToken {
  public constructor(
    private ltiToken: LTILaunchTokenData,
    private lmsRegister: LMSRegisterData,
    private ltPrivateKey: string,
    private scopes: Scope[],
  ) {}

  public async exec(): Promise<__AuthToken> {
    const loginJwtToken = await this.createAndSignJwtToken();
    const body = this.prepareLTIAuthForm(loginJwtToken);

    const authResponse = await fetch(this.lmsRegister.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const { access_token, expires_in, scope }: AuthResponse = await authResponse.json();

    return {
      token: access_token,
      expiresIn: expires_in,
      scopes: scope.split(" "),
    } satisfies __AuthToken;
  }

  private async createAndSignJwtToken() {
    const now = Math.floor(Date.now() / 1000);
    return await new jose.SignJWT({
      iss: this.ltiToken.tokenData.learningToolClientIdInsideLms,
      sub: this.ltiToken.tokenData.learningToolClientIdInsideLms,
      aud: this.lmsRegister.tokenEndpoint,
      iat: now,
      exp: now + 300,
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: "RS256" })
      .sign(await jose.importPKCS8(this.ltPrivateKey, "RS256"));
  }

  private prepareLTIAuthForm(loginJwtToken: string) {
    return new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.ltiToken.tokenData.learningToolClientIdInsideLms,
      client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: loginJwtToken,
      scope: this.scopes.join(" "),
    });
  }
}
