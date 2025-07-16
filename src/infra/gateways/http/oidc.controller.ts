import { Controller, Inject, Post, Request, Response } from "@nestjs/common";
import type { Request as HttpRequest, Response as HttpResponse } from "express";
import { LmsRegisters } from "src/infra/lti/lms-registers";
import { LmsLoginRequestBody } from "src/infra/lti/login-request";

@Controller({ path: "/oidc" })
export class OIDCController {
  @Inject(LmsRegisters) private registers: LmsRegisters;

  @Post("/login")
  async OIDCRedirect(
    @Request() request: HttpRequest,
    @Response() response: HttpResponse,
  ) {
    const lmsRequestBody = new LmsLoginRequestBody(request.body);
    const redirect = lmsRequestBody.intoLoginRedirect(this.registers);

    response.cookie("rndNonce", lmsRequestBody.randomNonce, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    response.cookie("xsrf", lmsRequestBody.randomState, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return response.redirect(redirect.toString());
  }
}
