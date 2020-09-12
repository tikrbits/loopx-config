export class RuntimeError extends Error {}

export class CodecRequiresMissingError extends Error {
  code: string;
  modules: string[];

  constructor(modules: string | string[], codec: string) {
    modules = Array.isArray(modules) ? modules : [modules];
    super(`Modules ${modules} are not found that required by "${codec}" codec`);
    this.code = 'MODULES_NOT_FOUND';
    this.modules = modules;
  }
}
