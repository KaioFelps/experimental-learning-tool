import { Controller, Inject, Post, Request, Response } from "@nestjs/common";
import type { Request as HttpRequest, Response as HttpResponse } from "express";
import { EnvVarsService } from "src/config/env/env.service";
import { xsrfTokenSessionKey } from "src/infra/lti";
import { LmsRegisters } from "src/infra/lti/lms-registers";
import { LmsLoginRequestBody } from "src/infra/lti/login-request";

@Controller({ path: "/oidc" })
export class OIDCController {
  @Inject(EnvVarsService) private env: EnvVarsService;
  @Inject(LmsRegisters) private registers: LmsRegisters;

  @Post("/login")
  async OIDCRedirect(
    @Request() request: HttpRequest,
    @Response() response: HttpResponse,
  ) {
    const lmsRequestBody = new LmsLoginRequestBody(request.body);
    const redirect = lmsRequestBody.intoLoginRedirect(this.registers);

    request.session[lmsRequestBody.randomNonce] = lmsRequestBody.getPayload();
    request.session[xsrfTokenSessionKey] = lmsRequestBody.randomState;
    request.session.save();

    return response.redirect(redirect.toString());
  }
}
