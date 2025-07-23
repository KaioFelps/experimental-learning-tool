import { Module } from "@nestjs/common";
import { LtiModule } from "../lti/lti.module";
import { HomeController } from "./home.controller";
import { HomeService } from "./service";

@Module({
  imports: [LtiModule],
  providers: [HomeService],
  controllers: [HomeController],
})
export class HomeModule {}
