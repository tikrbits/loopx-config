import {Codec} from '../types';

export interface JsonCodecOptions {
  spacing?: string | number;
  receiver?(this: any, key: string, value: any): any;
  replacer?(this: any, key: string, value: any): any;
}

export class JsonCodec implements Codec {
  readonly lang: string = 'json';
  readonly extensions: string[] = ['.json'];

  decode(str: string, options?: JsonCodecOptions): any {
    return JSON.parse(str, options?.receiver);
  }

  encode(obj: any, options?: JsonCodecOptions): string {
    return JSON.stringify(obj, options?.replacer, options?.spacing);
  }
}

export const json = new JsonCodec();
