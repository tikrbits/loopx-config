import {Codec} from '../types';

export interface TomlCodecOptions {
  /**
   * The amount text to parser per pass through the event loop. Defaults to 40kb (`40000`).
   */
  blocksize: number;
}

export class TomlCodec implements Codec {
  readonly lang: string = 'toml';
  readonly extensions: string[] = ['.toml'];
  readonly require = ['@iarna/toml'];

  constructor(protected options: Partial<TomlCodecOptions> = {}) {}

  decode(str: string, options?: TomlCodecOptions): any {
    return require('@iarna/toml').parse(str, options);
  }

  encode(obj: any): string {
    return require('@iarna/toml').stringify(obj);
  }
}

export const toml = new TomlCodec();
