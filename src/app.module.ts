import { Module } from "@nestjs/common";
import { EnvModule } from "./config/env/env.module";
import { HttpModule } from "./infra/gateways/http/http.module";
import { LtiModule } from "./infra/lti/lti.module";

@Module({ imports: [EnvModule, HttpModule, LtiModule] })
export class AppModule {}
