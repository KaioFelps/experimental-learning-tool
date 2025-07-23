import { Module } from "@nestjs/common";
import { LtiController } from "./controllers/lti.controller";
import { OIDCController } from "./controllers/oidc.controller";
import { LmsRegisters } from "./lms-registers";
import { LMSRepository } from "./lms-repository";
import { LtiService } from "./service";

@Module({
  providers: [LmsRegisters, LtiService, LMSRepository],
  exports: [LmsRegisters, LMSRepository],
  controllers: [LtiController, OIDCController],
})
export class LtiModule {}
