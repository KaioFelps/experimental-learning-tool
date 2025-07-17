import { Module } from "@nestjs/common";
import { AppModule } from "./modules/app.module";
import { ConfigModule } from "./modules/config/config.module";

@Module({ imports: [ConfigModule, AppModule] })
export class RootModule {}
