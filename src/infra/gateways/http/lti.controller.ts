import { All, Controller, Get, Query, Req, Res } from "@nestjs/common";
import { HttpRequest, HttpResponse } from "src/lib/nest";

@Controller({ path: "lti" })
export class LtiController {
  @All("launch")
  async launch(@Req() request: HttpRequest, @Res() response: HttpResponse) {
    console.log(request.cookies);
    response.redirect("/");
  }
}
