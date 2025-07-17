import { randomBytes } from "node:crypto";
import type { OIDCLogin } from "./dtos/login-request";
import type { LmsData } from "./lms-registers";

export class OIDCRedirectBuilder {
  public randomState = OIDCRedirectBuilder.genSecureState();
  public randomNonce = OIDCRedirectBuilder.genSecureState();

  private static genSecureState(): string {
    return randomBytes(32).toString("hex");
  }

  public constructor(
    private oidcLogin: OIDCLogin,
    private lmsData: LmsData,
  ) {}

  public buildRedirectUrl(): URL {
    const redirectUrl = new URL(this.lmsData.authEndpoint);

    redirectUrl.searchParams.set("scope", "openid");
    redirectUrl.searchParams.set("response_type", "id_token");
    redirectUrl.searchParams.set("client_id", this.oidcLogin.client_id);
    redirectUrl.searchParams.set(
      "redirect_uri",
      this.oidcLogin.target_link_uri,
    );
    redirectUrl.searchParams.set("login_hint", this.oidcLogin.login_hint);
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
    redirectUrl.searchParams.set(
      "lti_message_hint",
      this.oidcLogin.lti_message_hint,
    );

    return redirectUrl;
  }
}
