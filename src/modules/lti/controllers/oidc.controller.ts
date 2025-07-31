import { BadRequestException, Controller, Post, Request, Response } from "@nestjs/common";
import type { Request as HttpRequest, Response as HttpResponse } from "express";
import { either, option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { XSRF_SESSION_KEY } from "lti/src";
import { treeifyError } from "zod";
import { OIDCLoginToken } from "$/auth/login";
import { LMSRegisters } from "$/register/registers";

@Controller({ path: "/oidc" })
export class OIDCController {
  public constructor(private registers: LMSRegisters) {}

  @Post("/login")
  async OIDCRedirect(@Request() request: HttpRequest, @Response() response: HttpResponse) {
    const login = pipe(
      OIDCLoginToken.tryFromObject(request.body),
      either.match(
        (error) => {
          throw new BadRequestException(treeifyError(error));
        },
        (login) => login,
      ),
    );

    const redirectBuilder = pipe(
      login.intoOIDCRedirect(this.registers),
      option.match(
        () => {
          throw new BadRequestException(
            "Essa learning tool não foi registrada corretamente no LMS.",
          );
        },
        (redirect) => redirect,
      ),
    );

    request.session[redirectBuilder.randomNonce] = login.payload;
    request.session[XSRF_SESSION_KEY] = redirectBuilder.randomState;
    request.session.save();

    return response.redirect(redirectBuilder.toString());
  }
}
