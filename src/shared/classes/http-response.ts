import { EMensagem } from '../enums/mensagem.enum';
import { IResponse } from '../interfaces/response.interface';

export class HttpResponse<T> implements IResponse<T> {
  message = '';
  data: T | null | undefined;
  count: number | null | undefined;

  constructor(data: T | null | undefined, message = '', count?: number | null | undefined) {
    this.message = message;
    this.data = data;
    this.count = count;
  }

  onSuccess(message: string): IResponse<T> {
    this.message = message;
    return this;
  }

  onCreated(): IResponse<T> {
    this.message = EMensagem.SalvoSucesso;
    return this;
  }

  onUpdate(): IResponse<T> {
    this.message = EMensagem.AtualizadoSucesso;
    return this;
  }

  onUnactivated(): IResponse<T> {
    this.message = EMensagem.DesativadoSucesso;
    return this;
  }
}
