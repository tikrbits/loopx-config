import path from 'path';
import fs from 'fs';
import {Codec} from './types';
import {codecs, findCodec} from './codecs';

export interface Detected {
  file: string;
  lang: string;
  codec: Codec;
}

export function detect(file: string, lang?: string): Detected | undefined {
  const extension = path.extname(file);
  const codec = findCodec({lang, extension});
  if (!codec && lang) {
    // unsupported lang
    return;
  }

  if (codec && !lang) {
    // exactly match
    return {file, lang: codec.lang, codec};
  }

  if (codec) {
    // detect by lang
    for (const ext of codec.extensions) {
      const f = file + ext;
      if (fs.existsSync(f)) {
        return {file: f, lang: codec.lang, codec};
      }
    }
  } else {
    // detect by supported codecs
    for (const c of Object.values(codecs)) {
      for (const ext of c.extensions) {
        const f = file + ext;
        if (fs.existsSync(f)) {
          return {file: f, lang: c.lang, codec: c};
        }
      }
    }
  }
}
