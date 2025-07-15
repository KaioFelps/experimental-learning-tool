import { Injectable, Scope } from "@nestjs/common";
import z from "zod";
import { deepFreeze } from "../../utils/deep-freeze";

const environmentVariablesSchema = z.object({
  app: z.object({
    port: z.coerce.number().optional().default(3000),
  }),

  db: z.object({
    name: z.string(),
    user: z.string(),
    password: z.string(),
    port: z.coerce.number(),
  }),

  lti: z.object({
    clientId: z.string(),
    lmsAsIssuer: z.string(),
    jwksEndpoint: z.string(),
    authEndpoint: z.string(),
    tokenEndpoint: z.string(),
    privateKey: z.string(),
  }),
});

type EnvVars = z.infer<typeof environmentVariablesSchema>;

@Injectable({ scope: Scope.DEFAULT })
export class EnvVarsService {
  private readonly _vars: EnvVars;
  private constructor(vars: EnvVars) {
    this._vars = vars;
  }

  public static parse(): EnvVarsService {
    const processEnvVars: DeepPartial<EnvVars> = {
      app: {
        port: process.env.PORT as number | undefined,
      },
      db: {
        name: process.env.MOODLE_DB_NAME,
        user: process.env.MOODLE_DB_USER,
        password: process.env.MOODLE_DB_PASSWORD,
        port: process.env.MOODLE_DB_PORT as number | undefined,
      },
      lti: {
        clientId: process.env.LTI_CLIENT_ID,
        jwksEndpoint: process.env.LTI_JWKS_ENDPOINT,
        tokenEndpoint: process.env.LTI_TOKEN_ENDPOINT,
        authEndpoint: process.env.LTI_AUTH_ENDPOINT,
        privateKey: process.env.LTI_PRIV_KEY,
        lmsAsIssuer: process.env.LMS_ISSUER_KEY,
      },
    };

    const vars = environmentVariablesSchema.parse(processEnvVars);

    deepFreeze(vars);
    return new EnvVarsService(vars);
  }

  public get vars() {
    return this._vars;
  }
}
