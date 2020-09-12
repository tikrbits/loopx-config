import {Codec} from '../types';
import {yaml} from './yaml';
import {json} from './json';
import {ini} from './ini';
import {toml} from './toml';
import {checkPackages} from '../common';
import {CodecRequiresMissingError} from '../errors';

export * from './json';
export * from './ini';
export * from './yaml';
export * from './toml';

export const codecs: Codec[] = [yaml, json, ini, toml];

export interface FindLoaderOptions {
  lang?: string;
  extension?: string;
}

export function findCodec(options: FindLoaderOptions) {
  const {lang, extension} = options;
  if (lang) {
    return codecs.find(c => c.lang === lang.toLowerCase());
  }
  if (extension) {
    return codecs.find(c => c.extensions.includes(extension.toLowerCase()));
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
