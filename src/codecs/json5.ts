import {Codec} from '../types';

export interface Json5CodecOptions {
  spacing?: string | number;
  receiver?(this: any, key: string, value: any): any;
  replacer?(this: any, key: string, value: any): any;
}

export class Json5Codec implements Codec {
  readonly lang: string = 'json5';
  readonly extensions: string[] = ['.json5'];
  readonly require = ['json5'];

  decode(str: string, options?: Json5CodecOptions): any {
    return require('json5').parse(str, options?.receiver);
  }

  encode(obj: any, options?: Json5CodecOptions): string {
    return require('json5').stringify(obj, options?.replacer, options?.spacing);
  }
}

export const json5 = new Json5Codec();
