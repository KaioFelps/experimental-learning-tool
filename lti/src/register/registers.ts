import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { KeysSet } from "./keys-set";

export class LMSRegisterData {
  public constructor(
    public tokenEndpoint: string,
    public authEndpoint: string,
    public clientId: string,
    public lms: string,
    public keysSet: KeysSet,
  ) {}
}

type RegisterArgs = {
  jwksEndpoint: string;
  tokenEndpoint: string;
  authEndpoint: string;
  clientId: string;
  lms: string;
};

export class LMSRegisters {
  private registersMap: Map<string, LMSRegisterData> = new Map();

  public register({ jwksEndpoint, authEndpoint, clientId, lms, tokenEndpoint }: RegisterArgs) {
    const key = LMSRegisters.formatKey(clientId, lms);
    const keysSet = new KeysSet(jwksEndpoint);

    this.registersMap.set(
      key,
      new LMSRegisterData(tokenEndpoint, authEndpoint, clientId, lms, keysSet),
    );
  }

  public get(clientId: string, lms: string): option.Option<LMSRegisterData> {
    return pipe(
      option.fromNullable(LMSRegisters.formatKey(clientId, lms)),
      option.map((key) => this.registersMap.get(key)),
      option.map(option.fromNullable),
      option.flatten,
    );
  }

  private static formatKey(clientId: string, lms: string): string {
    return `${clientId}-${lms}`;
  }
}
