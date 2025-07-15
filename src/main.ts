import { NestFactory } from "@nestjs/core";
import { configDotenv } from "dotenv";
import { AppModule } from "./app.module";
import { EnvVarsService } from "./config/env/env.service";

async function bootstrap() {
  configDotenv();

  const app = await NestFactory.create(AppModule);
  const env = app.get(EnvVarsService);

  await app.listen(env.vars.app.port);
}

bootstrap();
