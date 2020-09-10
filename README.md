# @tib/config

> A Hierarchical node.js configuration library with files, environment variables, command-line arguments, and atomic
> object merging.

## Example

```js
const {Config} = require('@tib/config');

const conf = new Config();

//
// 1. any overrides
//
conf.overrides({
  always: 'be this value',
});

//
// 2. `process.env`
// 3. `process.argv`
//
conf.env().argv();

//
// 4. Values in `config.json`
//
conf.file('/path/to/config.json');

//
// Or with a custom name
// Note: A custom key must be supplied for hierarchy to work if multiple files are used.
//
conf.file('custom', '/path/to/config.json');

//
// Or searching from a base directory.
// Note: `name` is optional.
//
conf.file(name, {
  file: 'config.json',
  dir: 'search/from/here',
  search: true,
});

//
// 5. Any default values
//
conf.defaults({
  'if nothing else': 'use this value',
});
```
