import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { KeysSet } from "./keys-set";
import { IRegisterStore } from "./register-store";

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
  public constructor(private store: IRegisterStore) {}

  public register({ jwksEndpoint, authEndpoint, clientId, lms, tokenEndpoint }: RegisterArgs) {
    const key = LMSRegisters.formatKey(clientId, lms);
    const keysSet = new KeysSet(jwksEndpoint);

    this.store.save(
      key,
      new LMSRegisterData(tokenEndpoint, authEndpoint, clientId, lms, keysSet),
    );
  }

  public get(clientId: string, lms: string): option.Option<LMSRegisterData> {
    return pipe(
      option.fromNullable(LMSRegisters.formatKey(clientId, lms)),
      option.map((key) => this.store.get(key)),
      option.map(option.fromNullable),
      option.flatten,
    );
  }

  private static formatKey(clientId: string, lms: string): string {
    return `${clientId}-${lms}`;
  }
}
