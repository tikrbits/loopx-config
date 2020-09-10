/*
 * argv.ts: Simple memory-based store for command-line arguments.
 *
 * (C) 2020, Yvan Tao.
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {Argv as YArgv, Options as YOptions} from 'yargs';
import {Memory, MemoryOptions} from './memory';
import {encodeKey, parseValues, transform} from '../common';
import {TransformFn} from '../types';

export interface ArgvOptions extends MemoryOptions, Record<string, YOptions> {
  readOnly: boolean;
  separator: string | RegExp;
  transform: TransformFn;
  // options: Record<string, Options>;
  usage?: string;
}

export type PossibleArgvOptions = string | Partial<ArgvOptions> | YArgv;

//
// ### function Argv (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Argv config store, a simple abstraction
// around the Memory store that can read command-line arguments.
//
export class Argv extends Memory {
  static type = 'argv';
  yargs: YArgv;
  options: Partial<ArgvOptions>;
  usage?: string;
  transform?: TransformFn;
  separator: string | RegExp;

  showHelp: (consoleLevel?: string) => YArgv<any>;
  help: () => YArgv<any>;

  constructor(options?: PossibleArgvOptions) {
    let opts: Partial<ArgvOptions> | YArgv = typeof options === 'string' ? {separator: options} : options ?? {};
    super(isYargs(opts) ? {} : opts);

    if (isYargs(opts)) {
      this.yargs = opts;
      opts = <Partial<ArgvOptions>>{};
    }
    const {readOnly, parseValues: _parseValues, separator, transform: _transform, usage, ...others} = opts;

    this.readOnly = readOnly ?? true;
    this.parseValues = _parseValues ?? false;
    this.separator = separator ?? '';
    this.transform = _transform;
    this.usage = usage;

    this.options = others;
  }

  //
  // ### function loadSync ()
  // Loads the data passed in from `process.argv` into this instance.
  //
  loadSync() {
    this.loadArgv();
    return this.store;
  }

  //
  // ### function loadArgv ()
  // Loads the data passed in from the command-line arguments
  // into this instance.
  //
  loadArgv() {
    const y: YArgv =
      this.yargs ??
      (typeof this.options === 'object'
        ? require('yargs')(process.argv.slice(2)).options(<any>this.options)
        : require('yargs')(process.argv.slice(2)));

    if (typeof this.usage === 'string') {
      y.usage(this.usage);
    }

    let argv = y.argv;

    if (!argv) {
      return;
    }

    if (this.transform) {
      argv = transform(argv, this.transform);
    }

    let tempWrite = false;

    if (this.readOnly) {
      this.readOnly = false;
      tempWrite = true;
    }
    Object.keys(argv).forEach(key => {
      let val = argv[key];

      if (val != null) {
        if (this.parseValues) {
          val = parseValues((val as any).toString());
        }

        if (this.separator) {
          this.set(encodeKey(...key.split(this.separator)), val);
        } else {
          this.set(key, val);
        }
      }
    });

    this.showHelp = y.showHelp;
    this.help = y.help;

    if (tempWrite) {
      this.readOnly = true;
    }
    return this.store;
  }
}

function isYargs(obj: any): obj is YArgv {
  return (typeof obj === 'function' || typeof obj === 'object') && 'argv' in obj;
}
