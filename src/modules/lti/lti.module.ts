import { Module } from "@nestjs/common";
import { LtiController } from "./controllers/lti.controller";
import { OIDCController } from "./controllers/oidc.controller";
import { LmsRegisters } from "./lms-registers";

@Module({
  providers: [LmsRegisters],
  exports: [LmsRegisters],
  controllers: [LtiController, OIDCController],
})
export class LtiModule {}
