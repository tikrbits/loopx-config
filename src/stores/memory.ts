/*
 * memory.ts: Simple memory storage engine for config configuration(s)
 *
 * (C) 2020, Yvan Tao
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {loadFilesSync} from '../utils';
import {decodeKey, keyed, parseValues} from '../common';
import {AbstractStore, StoreOptions} from '../store';
import {Codec} from '../types';

export interface MemoryOptions extends StoreOptions {
  loadFrom: string;
  logicalSeparator: string;
  parseValues: boolean;
}

export type PossibleMemoryOptions = Partial<MemoryOptions>;

//
// ### class Memory (options)
// #### @options {Object} Options for this instance
// Constructor function for the Memory config store which maintains
// a nested json structure based on key delimiters `:`.
//
// e.g. `my:nested:key` ==> `{ my: { nested: { key: } } }`
//

export class Memory extends AbstractStore {
  static type = 'memory';

  protected _store: Record<string, any>;
  mtimes: Record<string, number>;
  readOnly: boolean;
  loadFrom: string | string[];
  logicalSeparator: string;
  parseValues: boolean;

  constructor(options?: PossibleMemoryOptions) {
    options = options ?? {};
    super();
    this._store = {};
    this.mtimes = {};
    this.readOnly = false;
    this.loadFrom = options.loadFrom ?? '';
    this.logicalSeparator = options.logicalSeparator ?? ':';
    this.parseValues = options.parseValues ?? false;

    if (this.loadFrom) {
      this._store = loadFilesSync(this.loadFrom);
    }
  }

  get store() {
    return this._store;
  }

  //
  // ### function get (key)
  // #### @key {string} Key to retrieve for this instance.
  // Retrieves the value for the specified key (if any).
  //
  get(key?: string) {
    let target: any = this._store;
    const path = decodeKey(key, this.logicalSeparator);

    //
    // Scope into the object to get the appropriate nested context
    //
    while (path.length > 0) {
      key = path.shift() ?? '';
      if (target && typeof target !== 'string' && key in target) {
        target = target[key];
        continue;
      }
      return undefined;
    }

    return target;
  }

  //
  // ### function set (key, value)
  // #### @key {string} Key to set in this instance
  // #### @value {literal|Object} Value for the specified key
  // Sets the `value` for the specified `key` in this instance.
  //
  set(key: string, value: any) {
    if (this.readOnly) {
      return false;
    }

    let target = this._store;
    const path = decodeKey(key, this.logicalSeparator);

    if (path.length === 0) {
      //
      // Root must be an object
      //
      if (!value || typeof value !== 'object') {
        return false;
      } else {
        this.reset();
        this._store = value;
        return true;
      }
    }

    //
    // Update the `mtime` (modified time) of the key
    //
    this.mtimes[key] = Date.now();

    //
    // Scope into the object to get the appropriate nested context
    //
    while (path.length > 1) {
      key = path.shift() ?? '';
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }

      target = target[key];
    }

    // Set the specified value in the nested JSON structure
    key = path.shift() ?? '';
    if (this.parseValues) {
      value = parseValues(value);
    }
    target[key] = value;
    return true;
  }

  //
  // ### function clear (key)
  // #### @key {string} Key to remove from this instance
  // Removes the value for the specified `key` from this instance.
  //
  clear(key: string) {
    if (this.readOnly) {
      return false;
    }

    let target = this._store;
    let value = target;
    const path = decodeKey(key, this.logicalSeparator);

    //
    // Remove the key from the set of `mtimes` (modified times)
    //
    delete this.mtimes[key];

    //
    // Scope into the object to get the appropriate nested context
    //
    for (let i = 0; i < path.length - 1; i++) {
      key = path[i];
      value = target[key];
      if (typeof value !== 'function' && typeof value !== 'object') {
        return false;
      }
      target = value;
    }

    // Delete the key from the nested JSON structure
    key = path[path.length - 1];
    delete target[key];
    return true;
  }

  //
  // ### function merge (key, value)
  // #### @key {string} Key to merge the value into
  // #### @value {literal|Object} Value to merge into the key
  // Merges the properties in `value` into the existing object value
  // at `key`. If the existing value `key` is not an Object, it will be
  // completely overwritten.
  //
  merge(key: string, value: any): boolean {
    if (this.readOnly) {
      return false;
    }

    //
    // If the key is not an `Object` or is an `Array`,
    // then simply set it. Merging is for Objects.
    //
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
      return this.set(key, value);
    }

    let target = this._store;
    const path = decodeKey(key, this.logicalSeparator);
    const fullKey = key;

    //
    // Update the `mtime` (modified time) of the key
    //
    this.mtimes[key] = Date.now();

    //
    // Scope into the object to get the appropriate nested context
    //
    while (path.length > 1) {
      key = path.shift() ?? '';
      if (!target[key]) {
        target[key] = {};
      }

      target = target[key];
    }

    // Set the specified value in the nested JSON structure
    key = path.shift() ?? '';

    //
    // If the current value at the key target is not an `Object`,
    // or is an `Array` then simply override it because the new value
    // is an Object.
    //
    if (typeof target[key] !== 'object' || Array.isArray(target[key])) {
      target[key] = value;
      return true;
    }

    return Object.keys(value).every(nested => {
      return this.merge(keyed(this.logicalSeparator, fullKey, nested), value[nested]);
    });
  }

  //
  // ### function reset (callback)
  // Clears all keys associated with this instance.
  //
  reset() {
    if (this.readOnly) {
      return false;
    }

    this.mtimes = {};
    this._store = {};
    return true;
  }

  //
  // ### function loadSync
  // Returns the store managed by this instance
  //
  loadSync() {
    return this._store ?? {};
  }

  saveSync(codec?: Codec): any {
    return null;
  }
}
