import {Codec} from '../types';

export interface IniCodecOptions {
  section: string;
  whitespace: boolean;
}

export class IniCodec implements Codec {
  readonly lang: string = 'ini';
  readonly extensions: string[] = ['.ini'];
  readonly requires = ['ini'];

  decode(str: string): any {
    return require('ini').decode(str);
  }

  encode(obj: any, options?: IniCodecOptions): string {
    return require('ini').encode(obj, options);
  }
}

export const ini = new IniCodec();
