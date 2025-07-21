import { either } from "fp-ts";
import z, { treeifyError } from "zod";
import { getRolesFromClaims } from "../../modules/lti/roles";

/// Dados extraídos de uma mensagem LTI Launch
const ltiTokenSchema = z.object({
  tokenData: z.object({
    lmsUrl: z.string(),
    learningToolClientIdInsideLms: z.string(),
    exp: z.number(),
    deploymentId: z.string(),
  }),
  user: z.object({
    id: z.string(),
    roles: z.object({
      membership: z.array(z.string()).optional(),
      institution: z.array(z.string()).optional(),
      system: z.array(z.string()).optional(),
    }),
  }),
  courseContext: z.object({
    courseId: z.string(),
    courseTitle: z.string(),
  }),
  // Como a LMS enxerga/publicita esta learning tool
  learningToolLaunchContext: z.object({
    // id de uma atividade, por exemplo
    toolIdInsideCourse: z.string(),
    titleOnResources: z.string(),
    descriptionOnResources: z.string(),
    redirectBackUrl: z.url(),
  }),
});

export type LtiToken = z.infer<typeof ltiTokenSchema>;

export class LtiTokenData {
  private constructor(private readonly data: LtiToken) {}

  public static fromLtiTokenUnchecked(ltiToken: LtiToken): LtiTokenData {
    return new LtiTokenData(ltiToken);
  }

  // biome-ignore lint/suspicious/noExplicitAny: It doesn't worth typing the token at this point
  public static fromLtiIdToken(idToken: Record<string, any>) {
    const contextClaim =
      idToken["https://purl.imsglobal.org/spec/lti/claim/context"];

    const ltContext =
      idToken["https://purl.imsglobal.org/spec/lti/claim/resource_link"];

    const { success, data, error } = ltiTokenSchema.safeParse({
      user: {
        id: idToken.sub,
        roles: getRolesFromClaims(
          idToken["https://purl.imsglobal.org/spec/lti/claim/roles"],
        ),
      },
      courseContext: {
        courseId: contextClaim.id,
        courseTitle: contextClaim.title,
      },
      learningToolLaunchContext: {
        titleOnResources: ltContext.title,
        descriptionOnResources: ltContext.description,
        toolIdInsideCourse: ltContext.id,
        redirectBackUrl:
          idToken[
            "https://purl.imsglobal.org/spec/lti/claim/launch_presentation"
          ].return_url,
      },
      tokenData: {
        exp: idToken.exp,
        learningToolClientIdInsideLms: idToken.aud,
        lmsUrl: idToken.iss,
        deploymentId:
          idToken["https://purl.imsglobal.org/spec/lti/claim/deployment_id"],
      },
    } satisfies LtiToken);

    if (!success) {
      return either.left(treeifyError(error));
    }

    return either.right(new LtiTokenData(data));
  }

  public getData() {
    return this.data;
  }

  public get tokenData() {
    return this.data.tokenData;
  }
  public get user() {
    return this.data.user;
  }
  public get courseContext() {
    return this.data.courseContext;
  }
  public get learningToolLaunchContext() {
    return this.data.learningToolLaunchContext;
  }
}
