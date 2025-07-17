import { either } from "fp-ts";
import z from "zod";

const ltiLaunchSchema = z.object({
  id_token: z.string(),
  state: z.string(),
});

type LtiLaunchType = z.infer<typeof ltiLaunchSchema>;
type Error = z.ZodError<LtiLaunchType>;

export class LtiLaunchDto {
  private constructor(
    public id_token: string,
    public state: string,
  ) {}

  public static fromObject(body: object): either.Either<Error, LtiLaunchDto> {
    const { success, data, error } = ltiLaunchSchema.safeParse(body);

    if (!success) {
      return either.left(error);
    }

    return either.right(new LtiLaunchDto(data.id_token, data.state));
  }
}
