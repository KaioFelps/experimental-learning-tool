import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  Request,
  Response,
} from "@nestjs/common";
import type { Request as HttpRequest, Response as HttpResponse } from "express";
import { either, option } from "fp-ts";
import { LmsRegisters } from "src/modules/lti/lms-registers";
import { treeifyError } from "zod";
import { XSRF_SESSION_KEY } from "../consts";
import { OIDCLogin } from "../dtos/login-request";

@Controller({ path: "/oidc" })
export class OIDCController {
  @Inject(LmsRegisters) private registers: LmsRegisters;

  @Post("/login")
  async OIDCRedirect(
    @Request() request: HttpRequest,
    @Response() response: HttpResponse,
  ) {
    const _login = OIDCLogin.fromObject(request.body);
    if (either.isLeft(_login)) {
      throw new BadRequestException(treeifyError(_login.left));
    }

    const login = _login.right;

    const _redirectBuilder = login.intoOIDCRedirectBuilder(this.registers);
    if (option.isNone(_redirectBuilder)) {
      throw new BadRequestException(
        "Essa learning tool não foi registrada corretamente no LMS.",
      );
    }

    const redirectBuilder = _redirectBuilder.value;

    request.session[redirectBuilder.randomNonce] = login.getPayload();
    request.session[XSRF_SESSION_KEY] = redirectBuilder.randomState;
    request.session.save();

    return response.redirect(redirectBuilder.buildRedirectUrl().toString());
  }
}
