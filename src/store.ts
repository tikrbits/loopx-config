import {Codec} from './types';

export type StoreOptions = Record<string, any>;

export interface Store {
  readonly type: string;
  readonly readOnly: boolean;
  readonly store: Record<string, any>;

  get<T>(key?: string): T;
  set(key: string, value: any): boolean;
  set(obj: any): boolean;
  reset(): boolean;
  clear(key: string): boolean;
  merge(key: string, value: any): boolean;

  load(): Promise<Record<string, any>>;
  loadSync(): Record<string, any>;

  save(codec?: Codec): Promise<any>;
  saveSync(codec?: Codec): any;
}

export interface StoreCtor<T extends Store = Store> {
  readonly type: string;
  new (options?: StoreOptions): T;
}

export abstract class AbstractStore implements Store {
  static readonly type: string;

  readonly readOnly: boolean;

  abstract get store(): Record<string, any>;
  abstract get<T>(key: string): T;
  abstract clear(key: string): boolean;
  abstract merge(key: string, value: any): boolean;
  abstract reset(): boolean;
  abstract doSet(key: string | any, value?: any): boolean;

  get type() {
    return (this.constructor as StoreCtor).type;
  }

  set(obj: any): boolean;
  set(key: string, value: any): boolean;
  set(key: string | any, value?: any): boolean {
    return this.doSet(key, value);
  }

  async load(): Promise<Record<string, any>> {
    return this.loadSync();
  }

  abstract loadSync(): Record<string, any>;

  save(codec?: Codec): Promise<any> {
    return this.saveSync();
  }

  abstract saveSync(codec?: Codec): any;
}
