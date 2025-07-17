import { Injectable } from "@nestjs/common";
import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import type { EnvVarsService } from "src/modules/config/env/env.service";

export type LmsData = {
  // Endpoint para buscar as chaves de validação
  JWKSEndpoint: string;
  tokenEndpoint: string;
  authEndpoint: string;
};

// Essa classe estática contém os registros dessa learning tool nas LMS
// Isso deve ser feito dinâmicamente, mantendo os registros salvos em um banco de dados,
// já que várias LMS podem registrar a learning tool (várias vezes, uma por curso, pelo menos).
@Injectable()
export class LmsRegisters {
  private registersMap: Map<string, LmsData>;
  private keysMap: KeysMap;

  public constructor(env: EnvVarsService) {
    this.keysMap = new KeysMap(env.vars.lti.jwksEndpoint);
    this.registersMap = new Map();
  }

  public register(clientId: string, lms: string, data: LmsData) {
    this.registersMap.set(`${clientId}-${lms}`, data);
  }

  public get(clientId: string, lms: string): LmsData | null {
    return this.registersMap.get(`${clientId}-${lms}`) ?? null;
  }

  public keys(): KeysMap {
    return this.keysMap;
  }
}

type Key = {
  kty: string;
  alg: string;
  kid: string;
  e: string;
  n: string;
  use: string;
};

class KeysMap {
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
    const keys = (await keysResponse.json()).keys.map((keyObj: Key) => [
      keyObj.kid,
      keyObj,
    ]);

    this.map = new Map(keys);

    const dayInMs = 86400000;
    const now = new Date();
    this.ttl = option.some(new Date(now.getTime() + dayInMs));
  }

  public async get(keyId: string): Promise<option.Option<Key>> {
    if (option.isNone(this.ttl) || this.ttl.value <= new Date()) {
      await this.update();
    }

    return pipe(this.map.get(keyId), option.fromNullable);
  }
}
