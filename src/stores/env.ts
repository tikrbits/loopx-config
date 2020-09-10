/*
 * env.ts: Simple memory-based store for environment variables
 *
 * (C) 2020, Yvan Tao.
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {TransformFn} from '../types';
import {encodeKey, parseValues, transform} from '../common';
import {Memory, MemoryOptions} from './memory';

export interface EnvOptions extends MemoryOptions {
  readOnly: boolean;
  whitelist: string[];
  separator: string | RegExp;
  lowerCase: boolean;
  transform: TransformFn;
  match: RegExp;
}

export type PossibleEnvOptions = string | Partial<EnvOptions>;

//
// ### function Env (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Env config store, a simple abstraction
// around the Memory store that can read process environment variables.
//
export class Env extends Memory {
  static type = 'env';

  whitelist: string[];
  separator: string | RegExp;
  lowerCase: boolean;
  transform?: TransformFn;
  match?: RegExp;

  constructor(options?: PossibleEnvOptions) {
    const opts: Partial<EnvOptions> = typeof options === 'string' ? {separator: options} : options ?? {};
    super(opts);

    this.readOnly = opts.readOnly ?? true;
    this.whitelist = opts.whitelist ?? [];
    this.separator = opts.separator ?? '';
    this.lowerCase = opts.lowerCase ?? false;
    this.parseValues = opts.parseValues ?? false;
    this.transform = opts.transform;
    this.match = opts.match;
  }

  //
  // ### function loadSync ()
  // Loads the data passed in from `process.env` into this instance.
  //
  loadSync() {
    this.loadEnv();
    return this.store;
  }

  //
  // ### function loadEnv ()
  // Loads the data passed in from `process.env` into this instance.
  //
  loadEnv() {
    let env = process.env;

    if (this.lowerCase) {
      env = {};
      Object.keys(process.env).forEach(key => {
        env[key.toLowerCase()] = process.env[key];
      });
    }

    if (this.transform) {
      env = transform(env, this.transform);
    }

    let tempWrite = false;

    if (this.readOnly) {
      this.readOnly = false;
      tempWrite = true;
    }

    Object.keys(env)
      .filter(key => {
        if (this.match && this.whitelist.length) {
          return key.match(this.match) ?? this.whitelist.indexOf(key) !== -1;
        } else if (this.match) {
          return key.match(this.match);
        } else {
          return !this.whitelist.length || this.whitelist.indexOf(key) !== -1;
        }
      })
      .forEach(key => {
        let val = env[key];

        if (this.parseValues) {
          val = parseValues(<string>val);
        }

        if (this.separator) {
          this.set(encodeKey(...key.split(this.separator)), val);
        } else {
          this.set(key, val);
        }
      });

    if (tempWrite) {
      this.readOnly = true;
    }

    return this.store;
  }
}
