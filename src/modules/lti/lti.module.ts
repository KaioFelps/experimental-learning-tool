import { Module } from "@nestjs/common";
import { LMSRegisters } from "lti/src/register/registers";
import { EnvVarsService } from "../config/env/env.service";
import { LtiController } from "./controllers/lti.controller";
import { OIDCController } from "./controllers/oidc.controller";
import { LMSRepository } from "./lms-repository";
import { LtiService } from "./service";

@Module({
  providers: [
    LtiService,
    LMSRepository,
    {
      provide: LMSRegisters,
      inject: [EnvVarsService],
      useFactory: (env: EnvVarsService) => {
        const registers = new LMSRegisters();

        registers.register({
          authEndpoint: env.vars.lti.authEndpoint,
          jwksEndpoint: env.vars.lti.jwksEndpoint,
          tokenEndpoint: env.vars.lti.tokenEndpoint,
          clientId: env.vars.lti.clientId,
          lms: env.vars.lti.lmsAsIssuer,
        });

        return registers;
      },
    },
  ],
  exports: [LMSRegisters, LMSRepository],
  controllers: [LtiController, OIDCController],
})
export class LtiModule {}
