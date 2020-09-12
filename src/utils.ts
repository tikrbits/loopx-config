import {detect} from './detect';
import {readFile, readFileSync} from './common';
import {Memory} from './stores';

export interface LoadOptions {
  lang?: string;
  files: string[];
}

//
// ### function loadFiles (files, callback)
// #### @files {Object|Array} List of files (or settings object) to load.
// #### @callback {function} Continuation to respond to when complete.
// Loads all the data in the specified `files`.
//
export async function loadFiles(options: string | string[] | LoadOptions) {
  if (typeof options === 'string') {
    options = [options];
  }
  const opts = <LoadOptions>(Array.isArray(options) ? {files: options} : options);
  const objs = await Promise.all(
    opts.files.map(async file => detect(file, opts.lang)?.codec.decode(await readFile(file))),
  );
  return merge(objs);
}

//
// ### function loadFilesSync (files)
// #### @files {Object|Array} List of files (or settings object) to load.
// Loads all the data in the specified `files` synchronously.
//
export function loadFilesSync(options: string | string[] | LoadOptions) {
  if (typeof options === 'string') {
    options = [options];
  }
  const opts = <LoadOptions>(Array.isArray(options) ? {files: options} : options);
  const objs = opts.files.map(file => detect(file, opts.lang)?.codec.decode(readFileSync(file)));
  return merge(objs);
}

//
// ### function merge (objs)
// #### @objs {Array} Array of object literals to merge
// Merges the specified `objs` using a temporary instance
// of `stores.Memory`.
//
export function merge(objs: Record<string, any>[]) {
  const store = new Memory();

  for (const obj of objs) {
    Object.keys(obj).forEach(key => store.merge(key, obj[key]));
  }

  return store.store;
}

export async function traverse<T = any, R = any>(
  obj: Record<string, T>,
  fn: (value: T) => Promise<R>,
): Promise<R | undefined> {
  const values = Object.values(obj);
  for (const value of values) {
    const result = await fn(value);
    if (result !== undefined) {
      return result;
    }
  }
}

export function traverseSync<T = any, R = any>(obj: Record<string, T>, fn: (value: T) => R): R | undefined {
  const values = Object.values(obj);
  for (const value of values) {
    const result = fn(value);
    if (result !== undefined) {
      return result;
    }
  }
}
