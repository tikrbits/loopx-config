import {Codec, isCodec} from '../types';
import {yaml} from './yaml';
import {json} from './json';
import {json5} from './json5';
import {ini} from './ini';
import {toml} from './toml';
import {checkPackages} from '../common';
import {CodecRequiresMissingError} from '../errors';

export * from './json';
export * from './json5';
export * from './ini';
export * from './yaml';
export * from './toml';

export const codecs: Record<string, Codec> = {yaml, json, json5, ini, toml};

export interface FindLoaderOptions {
  lang?: string;
  extension?: string;
}

export function findCodec(options: FindLoaderOptions) {
  const {lang, extension} = options;
  if (lang) {
    return Object.values(codecs).find(c => c.lang === lang.toLowerCase());
  }
  if (extension) {
    return Object.values(codecs).find(c => c.extensions.includes(extension.toLowerCase()));
  }
}

export function resolveCodec(options: Codec | string | FindLoaderOptions): Codec | undefined {
  if (isCodec(options)) {
    return options;
  } else if (typeof options === 'string') {
    return codecs[options.toLowerCase()];
  } else {
    return findCodec(options);
  }
}

export function checkCodecRequires(codec: Codec) {
  if (codec.requires) {
    const missings = checkPackages(codec.requires);
    if (missings?.length) {
      throw new CodecRequiresMissingError(missings, codec.constructor.name);
    }
  }
  return codec;
}
