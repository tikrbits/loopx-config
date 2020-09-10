import {OpenMode} from 'fs';

export type TransformFn = (obj: {key: string; value: any}) => any;

export interface FileReadOptions {
  encoding?: BufferEncoding;
  flag?: OpenMode;
}

export interface Codec {
  readonly lang: string;
  readonly extensions: string[];
  encode(obj: any, options?: any): string;
  decode(str: string, options?: any): any;
}

export interface CodecCtor<T extends Codec = Codec> {
  new (...args: any[]): T;
}
