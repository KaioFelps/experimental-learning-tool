import { randomBytes } from "node:crypto";
import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import type { LMSRegisterData, LMSRegisters } from "../register/registers";
import type { OIDCLoginDataType } from "./login/schema";

export class OIDCRedirect {
  public randomState = OIDCRedirect.genSecureState();
  public randomNonce = OIDCRedirect.genSecureState();
  private url: URL;

  public constructor(oidcLogin: OIDCLoginDataType, lmsData: LMSRegisterData) {
    const redirectUrl = new URL(lmsData.authEndpoint);

    redirectUrl.searchParams.set("scope", "openid");
    redirectUrl.searchParams.set("response_type", "id_token");
    redirectUrl.searchParams.set("client_id", oidcLogin.client_id);
    redirectUrl.searchParams.set("redirect_uri", oidcLogin.target_link_uri);
    redirectUrl.searchParams.set("login_hint", oidcLogin.login_hint);
    redirectUrl.searchParams.set("state", this.randomState);
    redirectUrl.searchParams.set("nonce", this.randomNonce);

    // Por padrão, a response_mode seria "query" e o Moodle enviaria uma requisição GET com o id_token + state
    // como Query Params, porém isso não é o esperado no novo padrão LTI 1.3.
    //
    // No LTI 1.3, o correto é o id_token e state serem enviados como corpo de uma requisição POST, e isso
    // é garantido setando "response_mode" como "form_post".
    redirectUrl.searchParams.set("response_mode", "form_post");

    // Diz para o OAuth não questionar o usuário quanto a nada, apenas prosseguir se ele estiver logado
    redirectUrl.searchParams.set("prompt", "none");
    redirectUrl.searchParams.set("lti_message_hint", oidcLogin.lti_message_hint);

    this.url = redirectUrl;
  }

  public static fromLMSRegisters(
    login: OIDCLoginDataType,
    lmsRegisters: LMSRegisters,
  ): option.Option<OIDCRedirect> {
    return pipe(
      lmsRegisters.get(login.client_id, login.iss),
      option.map((register) => new OIDCRedirect(login, register)),
    );
  }

  private static genSecureState(): string {
    return randomBytes(32).toString("hex");
  }

  public getURL(): URL {
    return this.url;
  }

  public toString(): string {
    return this.url.toString();
  }
}
