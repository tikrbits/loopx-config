import {StoreCtor} from '../store';
import {Memory} from './memory';
import {Argv} from './argv';
import {Env} from './env';
import {File} from './file';
import {Literal} from './literal';

export * from './memory';
export * from './argv';
export * from './env';
export * from './file';
export * from './literal';

export const Stores: Record<string, StoreCtor> = {
  [Memory.type]: Memory,
  [Literal.type]: Literal,
  [Argv.type]: Argv,
  [Env.type]: Env,
  [File.type]: File,
};
