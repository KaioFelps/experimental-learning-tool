import { Controller, Get, Render } from "@nestjs/common";

@Controller()
export class HomeController {
  @Get("/")
  @Render("index")
  async home() {}
}
