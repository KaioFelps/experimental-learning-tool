import { Controller, Get, Render, Req } from "@nestjs/common";
import type { HttpRequest } from "src/lib/nest";

@Controller()
export class HomeController {
  @Get("/")
  @Render("index")
  async home(@Req() request: HttpRequest) {
    const stringifiedToken = JSON.stringify(
      // biome-ignore lint/complexity/useLiteralKeys: Don't wanna need to augment SessionData interface
      request.session["ltiToken"],
      null,
      2,
    );

    return { userName: "Foo", stringifiedToken };
  }
}
