import fs from 'fs';
import {FileReadOptions, TransformFn} from './types';
import {RuntimeError} from './errors';

//
// ### function path (key)
// #### @key {string} The ':' delimited key to split
// Returns a fully-qualified path to a nested config key.
// If given null or undefined it should return an empty path.
// '' should still be respected as a path.
//
export function decodeKey(key?: string | null, separator?: string) {
  separator = separator ?? ':';
  return key ? key.split(separator) : [];
}

//
// ### function key (arguments)
// Returns a `:` joined string from the `arguments`.
//
export function encodeKey(...args: string[]) {
  return args.join(':');
}

//
// ### function key (arguments)
// Returns a joined string from the `arguments`,
// first argument is the join delimiter.
//
export function keyed(separator: string, ...args: string[]) {
  return args.join(separator);
}

export function stripBom(content: string | Buffer): string {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8');
  return content.replace(/^\uFEFF/, '');
}

export async function readFile(filepath: string, options: FileReadOptions = {}): Promise<string> {
  options = Object.assign({encoding: 'utf8'}, options);
  return stripBom(await fs.promises.readFile(filepath, <any>options));
}

export function readFileSync(filepath: string, options: FileReadOptions = {}): string {
  options = Object.assign({encoding: 'utf8'}, options);
  return stripBom(fs.readFileSync(filepath, <any>options));
}

//
// ### function capitalize (str)
// #### @str {string} String to capitalize
// Capitalizes the specified `str`.
//
export function capitalize(str: string) {
  return str && str[0].toUpperCase() + str.slice(1);
}

//
// ### function parseValues (any)
// #### @any {string} String to parse as native data-type or return as is
// try to parse `any` as a native data-type
//
export function parseValues(value: string) {
  let val: any = value;

  try {
    val = JSON.parse(value);
  } catch (ignore) {
    // Check for any other well-known strings that should be "parsed"
    if (value === 'undefined') {
      val = undefined;
    }
  }

  return val;
}

//
// ### function transform(map, fn)
// #### @map {object} Object of key/value pairs to apply `fn` to
// #### @fn {function} Transformation function that will be applied to every key/value pair
// transform a set of key/value pairs and return the transformed result
export function transform(map: Record<string, any>, fn: TransformFn) {
  const pairs = Object.keys(map).map(function (key) {
    const obj = {key: key, value: map[key]};
    const result = fn(obj);

    if (!result) {
      return null;
    } else if (result.key) {
      return result;
    }

    return new RuntimeError('Transform function passed to store returned an invalid format: ' + JSON.stringify(result));
  });

  return pairs
    .filter(function (pair) {
      return pair !== null;
    })
    .reduce(function (accumulator, pair) {
      accumulator[pair.key] = pair.value;
      return accumulator;
    }, {});
}

export function checkPackages(names: string[]): string[] | undefined {
  const modules: string[] = [];

  for (const name of names) {
    try {
      require(name);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message && e.message.indexOf(name) > 0) {
        modules.push(name);
      }
    }
  }

  if (modules.length) {
    return modules;
  }
}
