import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { workspaceDir } from "./consts";
import { AppModule } from "./modules/app.module";
import { ConfigModule } from "./modules/config/config.module";

@Module({
  imports: [
    ConfigModule,
    AppModule,
    ServeStaticModule.forRoot({
      rootPath: join(workspaceDir, "public"),
    }),
  ],
})
export class RootModule {}
