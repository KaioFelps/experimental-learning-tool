// Essa classe estática contém os registros dessa learning tool nas LMS
// Isso deve ser feito dinâmicamente, mantendo os registros salvos em um banco de dados,

import { Injectable } from "@nestjs/common";

// já que várias LMS podem registrar a learning tool (várias vezes, uma por curso, pelo menos).
@Injectable()
export class LmsRegisters {
  private mapaDeRegistros = new Map<string, LmsData>();

  public register(clientId: string, lms: string, data: LmsData) {
    this.mapaDeRegistros.set(`${clientId}-${lms}`, data);
  }

  public get(clientId: string, lms: string): LmsData | null {
    return this.mapaDeRegistros.get(`${clientId}-${lms}`) ?? null;
  }
}

export class LmsData {
  // Endpoint para buscar as chaves de validação
  public JWKSEndpoint: string;
  public tokenEndpoint: string;
  public authEndpoint: string;

  public constructor(data: Required<LmsData>) {
    Object.assign(this, data);
  }
}
