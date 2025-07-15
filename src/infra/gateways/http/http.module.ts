import { Module } from "@nestjs/common";
import { OIDCController } from "./oidc.controller";

@Module({
  controllers: [OIDCController],
})
export class HttpModule {}
