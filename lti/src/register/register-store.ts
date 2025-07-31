import { LMSRegisterData } from "./registers";

/**
 * Essa classe serve como interface para armazenar os registros das LMS.
 * Poderia, por exemplo, ser usado para persistir esses dados em algum BD.
 */
export abstract class IRegisterStore {
  abstract save(key: string, data: LMSRegisterData): void;
  abstract get(key: string): LMSRegisterData | null;
  abstract remove(key: string): void;
}

/**
 * Implementação simples, que mantém os registros em memória.
 */
export class InMemoryRegisterStore extends IRegisterStore {
  private registersMap: Map<string, LMSRegisterData> = new Map();

  save(key: string, data: LMSRegisterData): void {
    this.registersMap.set(key, data);
  }
  get(key: string): LMSRegisterData | null {
    return this.registersMap.get(key) ?? null;
  }
  remove(key: string): void {
    this.registersMap.delete(key);
  }
}
