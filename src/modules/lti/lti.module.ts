import { Global, Module } from "@nestjs/common";
import { EnvVarsService } from "../config/env/env.service";
import { LtiController } from "./controllers/lti.controller";
import { OIDCController } from "./controllers/oidc.controller";
import { type LmsData, LmsRegisters } from "./lms-registers";

@Global()
@Module({
  providers: [
    {
      provide: LmsRegisters,
      inject: [EnvVarsService],
      useFactory(env: EnvVarsService) {
        const lmsRegisters = new LmsRegisters(env);

        const data = {
          authEndpoint: env.vars.lti.authEndpoint,
          JWKSEndpoint: env.vars.lti.jwksEndpoint,
          tokenEndpoint: env.vars.lti.tokenEndpoint,
        } satisfies LmsData;

        lmsRegisters.register(
          env.vars.lti.clientId,
          env.vars.lti.lmsAsIssuer,
          data,
        );

        return lmsRegisters;
      },
    },
  ],
  exports: [LmsRegisters],
  controllers: [LtiController, OIDCController],
})
export class LtiModule {}
