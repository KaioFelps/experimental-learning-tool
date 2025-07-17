import { Global, Module } from "@nestjs/common";
import { EnvVarsService } from "./env.service";

@Global()
@Module({
  providers: [
    {
      provide: EnvVarsService,
      useFactory: () => EnvVarsService.parse(),
    },
  ],
  exports: [EnvVarsService],
})
export class EnvModule {}
