import { NestFactory } from "@nestjs/core";
import { configDotenv } from "dotenv";
import { AppModule } from "./app.module";
import { EnvVarsService } from "./config/env/env.service";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  configDotenv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.setViewEngine("ejs");
  const viewsDir = join(__dirname, "..", "views");
  app.setBaseViewsDir(viewsDir);

  const env = app.get(EnvVarsService);

  await app.listen(env.vars.app.port);
}

bootstrap();
