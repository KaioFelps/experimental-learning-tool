import { Module } from "@nestjs/common";
import { HomeModule } from "./home/home.module";
import { LtiModule } from "./lti/lti.module";

@Module({
  imports: [LtiModule, HomeModule],
})
export class AppModule {}
