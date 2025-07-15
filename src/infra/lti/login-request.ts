// Exemplo do body da requisição de login do Moodle
// iss: 'http://localhost',
// target_link_uri: 'http://localhost:3000',
// login_hint: '2',
// lti_message_hint: '{"cmid":2,"launchid":"ltilaunch1_1119048884"}',
// client_id: '9TPwzYHPXps3t4Y',
// lti_deployment_id: '1'

import { randomBytes } from "node:crypto";
import { UnauthorizedException } from "@nestjs/common";
import type { LmsRegisters } from "./lms-registers";

export class LmsLoginRequestBody {
  /** Issuer (url da LMS que está iniciando o launch)
   * Com base no Issuer (E TAMBÉM client_id) é que vamos:
   * - descobrir qual o endpoint de autenticação para onde devemos enviar a requisição
   * - encontrar a chave pública que baixamos (ou encontrar o endpoint para baixá-la) e verificar
   *   a integridade dos próximos tokens
   */
  public iss: string;
  /** Link do launch Learning Tool
   * A LMS irá enviar um post nesse uri com o `id_token`, completando o launch/linking.
   * Esse link é configurado na própria LMS quando a Learning Tool está sendo adicionada.
   */
  public target_link_uri: string;
  /** Contexto do login
   * Um valor único que identifica a sessão. É gerado pelo próprio Moodle (e também só é usado por ele).
   * Identifica aquele contexto específico, associando o estado da requisição ao aluno/usuário
   * logado no Moodle.
   */
  public login_hint: string;
  /** Metadados dessa mensagem
   * São informações utilizadas pelo Moodle e devem ser repassadas de volta para o Moodle o tempo inteiro.
   */
  public lti_message_hint: {
    /** Course Module ID
     * ID do curso do Moodle que está atrelado com essa ferramenta; do qual o launch está sendo feito
     */
    cmid: number;
    /** Algum identificador desse launch usado de alguma forma pelo Moodle */
    launchid: string;
  };
  /** ID atribuído à LT pela LMS
   * O Moodle quem gera esse ID (por exemplo) e precisamos registrá-lo aqui.
   * Com esse id podemos encontrar a chave (via endpoint de LWKS da LMS) para validar o `id_token`.
   */
  public client_id: string;
  /** Outro ID atribuído à LT pela LMS
   * A diferença é que o client_id é único entre a LT e um LMS.
   * Já o ID de deployment muda de curso pra curso. Isso é, esse deploymend_id é único do curso X, mas
   * a chave do client_id serve para validar os tokens de todos os cursos dessa LMS.
   *
   * Esse valor é enviado pela LMS na requisição, diferente do client_id que é fornecido na hora do registro.
   */
  public lti_deployment_id: string;

  public randomState = LmsLoginRequestBody.genSecureState();
  public randomNonce = LmsLoginRequestBody.genSecureState();

  public constructor(body: LmsLoginRequestBody) {
    this.client_id = body.client_id;
    this.iss = body.iss;
    this.login_hint = body.login_hint;
    this.lti_deployment_id = body.lti_deployment_id;
    this.lti_message_hint = JSON.parse(
      body.lti_message_hint as unknown as string,
    );
    this.target_link_uri = body.target_link_uri;
  }

  public intoLoginRedirect(registers: LmsRegisters): URL {
    const lmsData = registers.get(this.client_id, this.iss);

    if (!lmsData)
      throw new UnauthorizedException(
        "A LMS e a Learning Tool não foram corretamente configurados.",
      );

    const redirectUrl = new URL(lmsData.authEndpoint);

    redirectUrl.searchParams.set("scope", "openid");
    redirectUrl.searchParams.set("response_type", "id_token");
    redirectUrl.searchParams.set("client_id", this.client_id);
    redirectUrl.searchParams.set("redirect_uri", this.target_link_uri);
    redirectUrl.searchParams.set("login_hint", this.login_hint);
    redirectUrl.searchParams.set("state", this.randomState);
    redirectUrl.searchParams.set("nonce", this.randomNonce);
    redirectUrl.searchParams.set("prompt", "none"); // diz para o OAuth não questionar o usuário quanto a nada, apenas prosseguir se ele estiver logado
    redirectUrl.searchParams.set(
      "lti_message_hint",
      JSON.stringify(this.lti_message_hint),
    );

    return redirectUrl;
  }

  private static genSecureState(): string {
    return randomBytes(32).toString("hex");
  }
}
