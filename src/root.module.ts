import { Module } from "@nestjs/common";
import { AppModule } from "./modules/app.module";
import { ConfigModule } from "./modules/config/config.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "node:path";

@Module({
  imports: [
    ConfigModule,
    AppModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
    }),
  ],
})
export class RootModule {}
