import isEqual from '@tib/utils/is/equal';
import isPlainObject from '@tib/utils/is/plainObject';
import {Store, StoreOptions} from './store';
import {
  Argv,
  Env,
  File,
  FileOptions,
  Literal,
  Memory,
  PossibleArgvOptions,
  PossibleEnvOptions,
  PossibleFileOptions,
  PossibleLiteralOptions,
  PossibleMemoryOptions,
  Stores,
} from './stores';
import {Codec} from './types';
import {merge, traverseSync} from './utils';

export interface Source extends StoreOptions {
  type: string;
}

export interface ConfigOptions {
  type: string;
  store: StoreOptions;
  stores: Record<string, StoreOptions>;
  source: Source;
  sources: Record<string, Source>;
}

export type PossibleStoreOptions =
  | StoreOptions
  | PossibleArgvOptions
  | PossibleEnvOptions
  | PossibleFileOptions
  | PossibleLiteralOptions
  | PossibleMemoryOptions;

export class Config {
  stores: Record<string, Store>;
  sources: Store[];

  constructor(options: Partial<ConfigOptions> = {}) {
    this.stores = {};
    this.sources = [];
    this.init(options);
  }

  argv(options?: PossibleArgvOptions): this {
    return this.add('argv', options);
  }

  env(options?: PossibleEnvOptions): this {
    return this.add('env', options);
  }

  file(key: string, options?: Partial<FileOptions> | string): this;
  file(key: Partial<FileOptions> | string): this;
  file(key: string | Partial<FileOptions>, options?: Partial<FileOptions> | string): this {
    if (!options) {
      options = typeof key === 'string' ? {file: key} : key;
      key = 'file';
    } else {
      options = typeof options === 'string' ? {file: options} : options;
    }
    options.type = 'file';
    return this.add(<string>key, options);
  }

  defaults(options?: PossibleLiteralOptions) {
    options = Object.assign({type: 'literal'}, options);
    return this.add('defaults', options);
  }

  overrides(options?: PossibleLiteralOptions) {
    options = Object.assign({type: 'literal'}, options);
    return this.add('overrides', options);
  }

  //
  // ### function init (options)
  // #### @options {Object} Options to initialize this instance with.
  // Initializes this instance with additional `stores` or `sources` in the
  // `options` supplied.
  //
  init(options: Partial<ConfigOptions> = {}) {
    //
    // Add any stores passed in through the options
    // to this instance.
    //
    if (options.type) {
      this.add(options.type, options);
    } else if (options.store) {
      this.add(options.store.type, options.store);
    } else if (options.stores) {
      for (const name of Object.keys(options.stores)) {
        const store = options.stores[name];
        this.add(name, store);
      }
    }

    //
    // Add any read-only sources to this instance
    //
    if (options.source) {
      this.sources.push(this.create(options.source.type, options.source));
    } else if (options.sources) {
      for (const name of Object.keys(options.sources)) {
        const source = options.sources[name];
        this.sources.push(this.create(source.type || name, source));
      }
    }
  }

  //
  // ### function use (name, options)
  // #### @type {string} Type of the config store to use.
  // #### @options {Object} Options for the store instance.
  // Adds (or replaces) a new store with the specified `name`
  // and `options`. If `options.type` is not set, then `name`
  // will be used instead:
  //
  //    config.use('file');
  //    config.use('file', { type: 'file', filename: '/path/to/userconf' })
  //
  use(name: string, options: Record<string, any> = {}) {
    const store = this.stores[name];
    const update = store && !isEqual(store, options);

    if (!store || update) {
      if (update) {
        this.remove(name);
      }

      this.add(name, options);
    }

    return this;
  }

  //
  // ### function add (name, options)
  // #### @name {string} Name of the store to add to this instance
  // #### @options {Object} Options for the store to create
  // Adds a new store with the specified `name` and `options`. If `options.type`
  // is not set, then `name` will be used instead:
  //
  //    config.add('memory');
  //    config.add('userconf', { type: 'file', filename: '/path/to/userconf' })
  //
  add(name: string, options: any): this {
    options = options || {};
    const type = options.type || name;

    if (!Stores[type]) {
      throw new Error('Cannot add store with unknown type: ' + type);
    }

    this.stores[name] = this.create(type, options);
    this.stores[name].loadSync();

    return this;
  }

  //
  // ### function create (type, options)
  // #### @type {string} Type of the config store to use.
  // #### @options {Object} Options for the store instance.
  // Creates a store of the specified `type` using the
  // specified `options`.
  //
  create(type: 'argv', options?: PossibleArgvOptions): Argv;
  create(type: 'env', options?: PossibleEnvOptions): Env;
  create(type: 'file', options?: PossibleFileOptions): File;
  create(type: 'literal', options?: PossibleLiteralOptions): Literal;
  create(type: 'memory', options?: PossibleMemoryOptions): Memory;
  create<T extends Store = Store>(type: string, options?: PossibleStoreOptions): T;
  create<T extends Store = Store>(type: string, options?: any): T {
    return <T>new Stores[type](options);
  }

  //
  // ### function remove (name)
  // #### @name {string} Name of the store to remove from this instance
  // Removes a store with the specified `name` from this instance. Users
  // are allowed to pass in a type argument (e.g. `memory`) as name if
  // this was used in the call to `.add()`.
  //
  remove(name: string) {
    delete this.stores[name];
    return this;
  }

  get<T = any>(key: string): T | undefined {
    //
    // Otherwise the asynchronous, hierarchical `get` is
    // slightly more complicated because we do not need to traverse
    //
    // the entire set of stores, but up until there is a defined value.
    const names = Object.keys(this.stores);
    const objs: any[] = [];

    for (const name of names) {
      const value = this.stores[name].get(key);
      if (value === undefined) {
        continue;
      }
      if (!isPlainObject(value) && !objs.length) {
        return <T>value;
      }
      objs.push(value);
    }

    if (objs.length) {
      return <T>merge(objs.reverse());
    }
  }

  //
  // ### function any (keys, callback)
  // #### @keys {array|string...} Array of keys to query, or a variable list of strings
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Retrieves the first truthy value (if any) for the specified list of keys.
  //
  any(...keys: string[]): any;
  any(keys: string[]): any;
  any(...keys: any[]): any {
    if (Array.isArray(keys[0])) {
      keys = keys[0];
    }

    for (const key of keys) {
      const value = this.get(key);
      if (value != null) {
        return value;
      }
    }
  }

  //
  // ### function set (key, value, callback)
  // #### @key {string} Key to set in this instance
  // #### @value {literal|Object} Value for the specified key
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Sets the `value` for the specified `key` in this instance.
  //
  set(key: string, value: any): boolean | undefined {
    return traverseSync(this.stores, store => {
      if (!store.readOnly) {
        return store.set(key, value);
      }
    });
  }

  //
  // ### function required (keys)
  // #### @keys {array} List of keys
  // Throws an error if any of `keys` has no value, otherwise returns `true`
  required(keys: string[]) {
    const missing: string[] = [];
    for (const key of keys) {
      if (this.get(key) === undefined) {
        missing.push(key);
      }
    }
    if (missing.length) {
      throw new Error('Missing required keys: ' + missing.join(', '));
    }
    return this;
  }

  //
  // ### function reset (callback)
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Clears all keys associated with this instance.
  //
  reset(): boolean | undefined {
    return traverseSync(this.stores, store => store.reset());
  }

  //
  // ### function clear (key, callback)
  // #### @key {string} Key to remove from this instance
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Removes the value for the specified `key` from this instance.
  //
  clear(key: string): boolean | undefined {
    return traverseSync(this.stores, store => store.clear(key));
  }

  //
  // ### function merge ([key,] value [, callback])
  // #### @key {string} Key to merge the value into
  // #### @value {literal|Object} Value to merge into the key
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Merges the properties in `value` into the existing object value at `key`.
  //
  // 1. If the existing value `key` is not an Object, it will be completely overwritten.
  // 2. If `key` is not supplied, then the `value` will be merged into the root.
  //
  merge(key: Record<string, any>): boolean | undefined;
  merge(key: string, value: any): boolean | undefined;
  merge(key: string | Record<string, any>, value?: any): boolean | undefined {
    if (typeof key === 'string' && value !== undefined) {
      return traverseSync(this.stores, store => store.merge(key, value));
    }
    if (isPlainObject(key)) {
      const names = Object.keys(key);
      for (const name of names) {
        if (this.merge(name, key[name]) !== true) {
          return false;
        }
      }
      return true;
    }

    throw new Error('Cannot merge non-object into top-level.');
  }

  //
  // ### function load (callback)
  // #### @callback {function} Continuation to respond to when complete.
  // Responds with an Object representing all keys associated in this instance.
  //
  async load(): Promise<Record<string, any>> {
    if (this.sources.length) {
      const sourceHierarchy = this.sources.splice(0);
      sourceHierarchy.reverse();

      const data = merge(await Promise.all(sourceHierarchy.map(store => store.load())));
      if (data && typeof data === 'object') {
        this.use('sources', {
          type: 'literal',
          store: data,
        });
      }
    }

    const stores = Object.values(this.stores).reverse();
    return merge(await Promise.all(stores.map(store => store.load())));
  }

  loadSync(): Record<string, any> {
    if (this.sources.length) {
      const sourceHierarchy = this.sources.splice(0).reverse();
      const data = merge(sourceHierarchy.map(store => store.loadSync()));
      if (data && typeof data === 'object') {
        this.use('sources', {
          type: 'literal',
          store: data,
        });
      }
    }

    const stores = Object.values(this.stores).reverse();
    return merge(stores.map(store => store.loadSync()));
  }

  //
  // ### function save (callback)
  // #### @callback {function} **optional**  Continuation to respond to when
  // complete.
  // Instructs each config to save.  If a callback is provided, we will attempt
  // asynchronous saves on the configs, falling back to synchronous saves if
  // this isn't possible.  If a config does not know how to save, it will be
  // ignored.  Returns an object consisting of all of the data which was
  // actually saved.
  //
  async save(codec?: Codec): Promise<Record<string, any>> {
    return merge(
      (await Promise.all(Object.values(this.stores).map(store => store.save(codec)))).filter(
        data => data && typeof data === 'object',
      ),
    );
  }

  saveSync(codec?: Codec): Record<string, any> {
    return merge(
      Object.values(this.stores)
        .map(store => store.saveSync(codec))
        .filter(data => data && typeof data === 'object'),
    );
  }
}
