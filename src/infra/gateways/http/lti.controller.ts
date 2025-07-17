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
import { xsrfTokenSessionKey } from "src/infra/lti";
import { LmsRegisters } from "src/infra/lti/lms-registers";
import type { OIDCLoginPayload } from "src/infra/lti/login-request";
import type { HttpRequest, HttpResponse } from "src/lib/nest";
import z, { treeifyError } from "zod";

@Controller({ path: "lti" })
export class LtiController {
  @Inject(LmsRegisters) private lmsRegisters: LmsRegisters;

  @Post("launch")
  async launch(@Req() request: HttpRequest, @Res() response: HttpResponse) {
    const launch = LtiLaunchDto.parse(request.body);

    if (either.isRight(launch)) {
      throw new BadRequestException(treeifyError(launch.right));
    }

    const { id_token, state } = launch.left;

    const sessionState = request.session[xsrfTokenSessionKey];
    if (sessionState !== state) throw new UnauthorizedException();

    const header = JSON.parse(
      Buffer.from(id_token.split(".")[0], "base64url").toString(),
    );

    const _signingKey = await this.lmsRegisters.keys().get(header.kid!);

    const token = jose.decodeJwt(id_token) as jose.JWTPayload & {
      nonce: string;
    };

    const payload = request.session[token.nonce] as
      | undefined
      | OIDCLoginPayload;

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

    // TODO: remove this console.log
    console.log(verifiedToken);
    response.redirect("/");
  }
}

class LtiLaunchDto {
  private static schema = z.object({
    id_token: z.string(),
    state: z.string(),
  });

  private constructor(
    public id_token: string,
    public state: string,
  ) {}

  public static parse(
    body: object,
  ): either.Either<
    LtiLaunchDto,
    z.ZodError<z.Infer<typeof LtiLaunchDto.schema>>
  > {
    const { success, data, error } = LtiLaunchDto.schema.safeParse(body);

    if (!success) {
      return either.right(error);
    }

    return either.left(new LtiLaunchDto(data.id_token, data.state));
  }
}
