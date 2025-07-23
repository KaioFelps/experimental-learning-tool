import { Controller, Get, Render, Req } from "@nestjs/common";
import type { HttpRequest } from "src/lib/nest";
import { ACCESS_TOKEN_SESSION_KEY, LTI_TOKEN_SESSION_KEY } from "../lti/consts";
import { HomeService } from "./service";

@Controller()
export class HomeController {
  public constructor(private service: HomeService) {}

  @Get("/")
  @Render("index")
  async home(@Req() request: HttpRequest) {
    const stringifiedToken = JSON.stringify(
      // biome-ignore lint/complexity/useLiteralKeys: Don't wanna need to augment SessionData interface
      request.session["ltiToken"],
      null,
      2,
    );

    const users = await this.service.getMembersList(
      request.session[LTI_TOKEN_SESSION_KEY],
      request.session[ACCESS_TOKEN_SESSION_KEY],
    );

    return { userName: "Foo", stringifiedToken, users };
  }
}
