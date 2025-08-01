import { Module } from "@nestjs/common";
import { EnvModule } from "./env/env.module";

@Module({
  imports: [EnvModule],
  exports: [EnvModule],
})
export class ConfigModule {}
