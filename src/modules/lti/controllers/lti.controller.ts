import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { either, option } from "fp-ts";
import * as jose from "jose";
import type { HttpRequest, HttpResponse } from "src/lib/nest";
import { LmsRegisters } from "src/modules/lti/lms-registers";
import { treeifyError } from "zod";
import { XSRF_SESSION_KEY } from "../consts";
import type { OIDCLoginType } from "../dtos/login-request";
import { LtiLaunchDto } from "../dtos/lti-launch";

@Controller({ path: "lti" })
export class LtiController {
  @Inject(LmsRegisters) private lmsRegisters: LmsRegisters;

  @Post("launch")
  async launch(@Req() request: HttpRequest, @Res() response: HttpResponse) {
    const launch = LtiLaunchDto.fromObject(request.body);

    if (either.isLeft(launch)) {
      throw new BadRequestException(treeifyError(launch.left));
    }

    const { id_token, state } = launch.right;

    const sessionState = request.session[XSRF_SESSION_KEY];
    if (sessionState !== state) throw new UnauthorizedException();

    const token = await this.getVerifiedTokenPayloadOrThrow(request, id_token);

    // TODO: remover esse console.log
    console.log(token);
    response.redirect("/");
  }

  private async getVerifiedTokenPayloadOrThrow(
    request: HttpRequest,
    id_token: string,
  ): Promise<jose.JWTPayload> {
    const header = JSON.parse(
      Buffer.from(id_token.split(".")[0], "base64url").toString(),
    );

    const _signingKey = await this.lmsRegisters.keys().get(header.kid!);

    const token = jose.decodeJwt(id_token) as jose.JWTPayload & {
      nonce: string;
    };

    const payload = request.session[token.nonce] as undefined | OIDCLoginType;

    if (option.isNone(_signingKey) || !payload) {
      throw new UnauthorizedException();
    }

    const signingKey = _signingKey.value;

    const key = await jose.importJWK(signingKey, signingKey.alg);

    const verifiedToken = await jose.jwtVerify(id_token, key, {
      algorithms: [signingKey.alg],
      audience: payload.client_id,
      issuer: payload.iss,
    });

    return verifiedToken.payload;
  }
}
