import { Controller, Get, Render, Req } from "@nestjs/common";
import { ACCESS_TOKEN_SESSION_KEY, LTI_TOKEN_SESSION_KEY } from "lti/src";
import type { HttpRequest } from "src/lib/nest";
import { LTILaunchTokenData } from "$/tokens/launch";
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

    const token = request.session[LTI_TOKEN_SESSION_KEY] as LTILaunchTokenData;
    const accessToken = request.session[ACCESS_TOKEN_SESSION_KEY];

    const users = await this.service.getMembersList(token, accessToken);

    await this.service.getGrades(accessToken);
    console.log(users);

    return { userName: token.user.name, stringifiedToken, users };
  }
}
