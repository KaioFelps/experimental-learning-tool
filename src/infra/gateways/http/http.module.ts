import { Module } from "@nestjs/common";
import { HomeController } from "./home.controller";
import { LtiController } from "./lti.controller";
import { OIDCController } from "./oidc.controller";

@Module({
  controllers: [OIDCController, LtiController, HomeController],
})
export class HttpModule {}
