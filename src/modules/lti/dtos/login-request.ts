import { either, option } from "fp-ts";
import z from "zod";
import type { LmsRegisters } from "../lms-registers";
import { OIDCRedirectBuilder } from "../oidc-redirect-builder";

const oidcLoginSchema = z.object({
  /** Issuer (url da LMS que está iniciando o launch)
   * Com base no Issuer (E TAMBÉM client_id) é que vamos:
   * - descobrir qual o endpoint de autenticação para onde devemos enviar a requisição
   * - encontrar a chave pública que baixamos (ou encontrar o endpoint para baixá-la) e verificar
   *   a integridade dos próximos tokens
   */
  iss: z.string(),
  /** Link do launch Learning Tool
   * A LMS irá enviar um post nesse uri com o `id_token`, completando o launch/linking.
   * Esse link é configurado na própria LMS quando a Learning Tool está sendo adicionada.
   */
  target_link_uri: z.string(),
  /** Contexto do login
   * Um valor único que identifica a sessão. É gerado pelo próprio Moodle (e também só é usado por ele).
   * Identifica aquele contexto específico, associando o estado da requisição ao aluno/usuário
   * logado no Moodle.
   */
  login_hint: z.string(),
  /** Metadados dessa mensagem
   * São informações utilizadas pelo Moodle e devem ser repassadas de volta para o Moodle o tempo inteiro.
   * - Course Module ID (cmid): ID do curso do Moodle que está atrelado com essa ferramenta; do qual o launch está sendo feito
   * - launchid: Algum identificador desse launch usado de alguma forma pelo Moodle
   */
  lti_message_hint: z.string(),
  /** ID atribuído à LT pela LMS
   * O Moodle quem gera esse ID (por exemplo) e precisamos registrá-lo aqui.
   * Com esse id podemos encontrar a chave (via endpoint de LWKS da LMS) para validar o `id_token`.
   */
  client_id: z.string(),
  /** Outro ID atribuído à LT pela LMS
   * A diferença é que o client_id é único entre a LT e um LMS.
   * Já o ID de deployment muda de curso pra curso. Isso é, esse deploymend_id é único do curso X, mas
   * a chave do client_id serve para validar os tokens de todos os cursos dessa LMS.
   *
   * Esse valor é enviado pela LMS na requisição, diferente do client_id que é fornecido na hora do registro.
   */
  lti_deployment_id: z.string(),
});

export type OIDCLoginType = z.infer<typeof oidcLoginSchema>;
export type Error = z.ZodError<OIDCLoginType>;

export class OIDCLogin {
  private payload: OIDCLoginType;

  private constructor(payload: OIDCLoginType) {
    this.payload = payload;
  }

  public static fromObject(body: object): either.Either<Error, OIDCLogin> {
    const { success, data, error } = oidcLoginSchema.safeParse(body);

    if (!success) {
      return either.left(error);
    }

    return either.right(new OIDCLogin(data));
  }

  public get iss() {
    return this.payload.iss;
  }

  public get target_link_uri() {
    return this.payload.target_link_uri;
  }

  public get login_hint() {
    return this.payload.login_hint;
  }

  public get lti_message_hint() {
    return this.payload.lti_message_hint;
  }

  public get client_id() {
    return this.payload.client_id;
  }

  public get lti_deployment_id() {
    return this.payload.lti_deployment_id;
  }

  public intoOIDCRedirectBuilder(
    registers: LmsRegisters,
  ): option.Option<OIDCRedirectBuilder> {
    const lmsData = registers.get(this.client_id, this.iss);
    if (!lmsData) return option.none;
    return option.some(new OIDCRedirectBuilder(this, lmsData));
  }

  public getPayload(): OIDCLoginType {
    return this.payload;
  }
}
