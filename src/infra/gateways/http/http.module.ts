import { Module } from "@nestjs/common";
import { OIDCController } from "./oidc.controller";
import { LtiController } from "./lti.controller";
import { HomeController } from "./home.controller";

@Module({
  controllers: [OIDCController, LtiController, HomeController],
})
export class HttpModule {}
