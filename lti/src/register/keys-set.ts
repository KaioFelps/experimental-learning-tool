import { option } from "fp-ts";

export type Key = {
  kty: string;
  alg: string;
  kid: string;
  e: string;
  n: string;
  use: string;
};

export class KeysSet {
  private ttl: option.Option<Date>;
  private map: Map<string, Key>;
  private jwksEndpoint: string;

  public constructor(jwksEndpoint: string) {
    this.map = new Map();
    this.ttl = option.none;
    this.jwksEndpoint = jwksEndpoint;
  }

  private async update() {
    const keysResponse = await fetch(this.jwksEndpoint);
    const keys = (await keysResponse.json()).keys.map((keyObj: Key) => [keyObj.kid, keyObj]);

    this.map = new Map(keys);

    const dayInMs = 86400000;
    const now = new Date();
    this.ttl = option.some(new Date(now.getTime() + dayInMs));
  }

  public async get(keyId: string): Promise<option.Option<Key>> {
    if (option.isNone(this.ttl) || this.ttl.value <= new Date()) {
      await this.update();
    }

    return option.fromNullable(this.map.get(keyId));
  }
}
