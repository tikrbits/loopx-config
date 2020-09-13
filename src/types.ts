import {OpenMode} from 'fs';

export type TransformFn = (obj: {key: string; value: any}) => any;

export interface FileReadOptions {
  encoding?: BufferEncoding;
  flag?: OpenMode;
}

export interface Codec {
  readonly lang: string;
  readonly extensions: string[];
  readonly requires?: string[];
  encode(obj: any, options?: any): string;
  decode(str: string, options?: any): any;
}

export interface CodecCtor<T extends Codec = Codec> {
  new (...args: any[]): T;
}

export function isCodec(x: any): x is Codec {
  return x && typeof x === 'object' && typeof x.encode === 'function' && typeof x.decode === 'function';
}
