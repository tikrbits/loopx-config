import {Codec} from '../../types';

export class MissingRequiredCodec implements Codec {
  readonly lang: string = 'mrc';
  readonly extensions: string[] = ['.mrc'];
  readonly requires = ['module-not-exist'];

  decode(str: string, options?: any): any {
    return str;
  }

  encode(obj: any, options?: any): string {
    return obj;
  }
}
