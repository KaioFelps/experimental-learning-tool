import { Global, Module, Scope } from "@nestjs/common";
import { EnvVarsService } from "src/config/env/env.service";
import { LmsData, LmsRegisters } from "./lms-registers";

@Global()
@Module({
  providers: [
    {
      provide: LmsRegisters,
      inject: [EnvVarsService],
      scope: Scope.DEFAULT,
      useFactory(env: EnvVarsService) {
        const lmsRegisters = new LmsRegisters();

        const data = new LmsData({
          authEndpoint: env.vars.lti.authEndpoint,
          JWKSEndpoint: env.vars.lti.jwksEndpoint,
          tokenEndpoint: env.vars.lti.tokenEndpoint,
        });

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
})
export class LtiModule {}
