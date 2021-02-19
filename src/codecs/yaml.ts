import {Codec} from '../types';

export interface YamlCodecOptions {
  filename: string;

  /** indentation width to use (in spaces). */
  indent: number;
  /** when true, will not add an indentation level to array elements */
  noArrayIndent: boolean;
  /** do not throw on invalid types (like function in the safe schema) and skip pairs and single values with such types. */
  skipInvalid: boolean;
  /** specifies level of nesting, when to switch from block to flow style for collections. -1 means block style everwhere */
  flowLevel: number;
  /** Each tag may have own set of styles.    - "tag" => "style" map. */
  styles: {[x: string]: any};
  /** if true, sort keys when dumping YAML. If a function, use the function to sort the keys. (default: false) */
  sortKeys: boolean | ((a: any, b: any) => number);
  /** set max line width. (default: 80) */
  lineWidth: number;
  /** if true, don't convert duplicate objects into references (default: false) */
  noRefs: boolean;
  /** if true don't try to be compatible with older yaml versions. Currently: don't quote "yes", "no" and so on, as required for YAML 1.1 (default: false) */
  noCompatMode: boolean;
  /**
   * if true flow sequences will be condensed, omitting the space between `key: value` or `a, b`. Eg. `'[a,b]'` or `{a:{b:c}}`.
   * Can be useful when using yaml for pretty URL query params as spaces are %-encoded. (default: false).
   */
  condenseFlow: boolean;
}

export class YamlCodec implements Codec {
  readonly lang: string = 'yaml';
  readonly extensions: string[] = ['.yml', '.yaml'];
  readonly require = ['js-yaml'];

  constructor(protected options: Partial<YamlCodecOptions> = {}) {}

  decode(str: string, options?: YamlCodecOptions): any {
    return require('js-yaml').load(str, options);
  }

  encode(obj: any, options?: YamlCodecOptions): string {
    return require('js-yaml').dump(obj, options);
  }
}

export const yaml = new YamlCodec();
