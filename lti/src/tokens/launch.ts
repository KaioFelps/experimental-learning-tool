import { either } from "fp-ts";
import z from "zod";
import { parseLMSRoles } from "../roles";

/// Dados extraídos de uma mensagem LTI Launch
const ltiTokenSchema = z.object({
  tokenData: z.object({
    lmsFamilyCode: z.enum(["moodle"]),
    lmsUrl: z.string(),
    learningToolClientIdInsideLms: z.string(),
    exp: z.number(),
    deploymentId: z.string(),
    serviceEndpointsUrl: z.url(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
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
  lmsEndpoints: z.object({
    contextMembership: z.string(),
  }),
});

export type LTILaunchTokenData = z.infer<typeof ltiTokenSchema>;
export type LTILaunchTokenError = z.ZodError<LTILaunchTokenData>;

export class LTILaunchToken {
  private constructor(private readonly data: LTILaunchTokenData) {}

  public static fromLTILaunchTokenDataUnchecked(ltiToken: LTILaunchTokenData): LTILaunchToken {
    return new LTILaunchToken(ltiToken);
  }

  public static fromIdToken(
    // biome-ignore lint/suspicious/noExplicitAny: It doesn't worth typing the token at this point
    idToken: Record<string, any>,
  ): either.Either<LTILaunchTokenError, LTILaunchToken> {
    const contextClaim = idToken["https://purl.imsglobal.org/spec/lti/claim/context"];

    const ltContext = idToken["https://purl.imsglobal.org/spec/lti/claim/resource_link"];

    const { success, data, error } = ltiTokenSchema.safeParse({
      user: {
        id: idToken.sub,
        email: idToken.email,
        name: idToken.name,
        roles: parseLMSRoles(
          idToken["https://purl.imsglobal.org/spec/lti/claim/roles"] as string[],
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
          idToken["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url,
      },
      tokenData: {
        exp: idToken.exp,
        learningToolClientIdInsideLms: idToken.aud,
        lmsUrl: idToken.iss,
        deploymentId: idToken["https://purl.imsglobal.org/spec/lti/claim/deployment_id"],
        serviceEndpointsUrl:
          idToken["https://purl.imsglobal.org/spec/lti-bo/claim/basicoutcome"]
            .lis_outcome_service_url,
        lmsFamilyCode:
          idToken["https://purl.imsglobal.org/spec/lti/claim/tool_platform"]
            .product_family_code,
      },
      lmsEndpoints: {
        contextMembership:
          idToken["https://purl.imsglobal.org/spec/lti/claim/custom"]?.context_memberships_url,
      },
    } satisfies LTILaunchTokenData);

    if (!success) {
      return either.left(error);
    }

    return either.right(new LTILaunchToken(data));
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

  public get lmsEndpoints() {
    return this.data.lmsEndpoints;
  }
}
