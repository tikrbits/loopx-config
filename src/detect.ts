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
  const codec = findCodec({
    lang,
    extension: path.extname(file),
  });

  if (!codec && lang) {
    return;
  }

  if (codec) {
    if (fs.existsSync(file)) {
      return {file, lang: codec.lang, codec};
    }
    for (const ext of codec.extensions) {
      const f = file + ext;
      if (fs.existsSync(f)) {
        return {file: f, lang: codec.lang, codec};
      }
    }
  } else {
    for (const c of codecs) {
      for (const ext of c.extensions) {
        const f = file + ext;
        if (fs.existsSync(f)) {
          return {file: f, lang: c.lang, codec: c};
        }
      }
    }
  }
}
