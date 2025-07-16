import { NestFactory } from "@nestjs/core";
import { configDotenv } from "dotenv";
import { AppModule } from "./app.module";
import { EnvVarsService } from "./config/env/env.service";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";

async function bootstrap() {
  configDotenv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
  const viewsDir = join(__dirname, "..", "views");
  app.setBaseViewsDir(viewsDir);

  const env = app.get(EnvVarsService);
  await app.listen(env.vars.app.port);
}

bootstrap();
