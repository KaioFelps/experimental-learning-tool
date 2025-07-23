import {
  BadRequestException,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { either } from "fp-ts";
import type { HttpRequest, HttpResponse } from "src/lib/nest";
import { treeifyError } from "zod";
import {
  ACCESS_TOKEN_SESSION_KEY,
  LTI_TOKEN_SESSION_KEY,
  XSRF_SESSION_KEY,
} from "../consts";
import { LtiLaunchDto } from "../dtos/lti-launch";
import { LtiService } from "../service";

@Controller({ path: "lti" })
export class LtiController {
  public constructor(private ltiService: LtiService) {}

  @Post("launch")
  async launch(@Req() request: HttpRequest, @Res() response: HttpResponse) {
    const launch = LtiLaunchDto.fromObject(request.body);

    if (either.isLeft(launch))
      throw new BadRequestException(treeifyError(launch.left));

    const { id_token: idToken, state } = launch.right;

    checkXsrfOrThrow(request.session[XSRF_SESSION_KEY], state);

    const tokenData = await this.ltiService.decodeAndVerifyIdToken(
      request,
      idToken,
    );
    request.session[LTI_TOKEN_SESSION_KEY] = tokenData.getData();

    const token = await this.ltiService.getAuthToken(tokenData);
    request.session[ACCESS_TOKEN_SESSION_KEY] = token;

    response.redirect("/");
  }
}

function checkXsrfOrThrow(stored: string, incoming: string) {
  if (stored !== incoming) throw new UnauthorizedException();
}
