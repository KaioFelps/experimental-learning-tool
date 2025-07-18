import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import * as cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import * as session from "express-session";
import { EnvVarsService } from "./modules/config/env/env.service";
import { RootModule } from "./root.module";

async function bootstrap() {
  configDotenv();

  const app = await NestFactory.create<NestExpressApplication>(RootModule);

  const key = "gen-some-secure-secret-key-later";
  app.use(cookieParser());
  app.use(
    session({
      secret: key,
      resave: false,
      saveUninitialized: false,
      name: "experimental-lt-session-id",
    }),
  );

  app.setViewEngine("ejs");
  const viewsDir = join(__dirname, "..", "resources", "views");
  app.setBaseViewsDir(viewsDir);

  const env = app.get(EnvVarsService);
  await app.listen(env.vars.app.port);
}

bootstrap();
