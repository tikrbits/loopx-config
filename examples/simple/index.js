const {conf} = require('../..');

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
conf.file('./config1.json');

//
// Or with a custom name
// Note: A custom key must be supplied for hierarchy to work if multiple files are used.
//
conf.file('custom', './config2.json');

//
// Or searching from a base directory.
// Note: `name` is optional.
//
conf.file('app', {
  file: 'config.json',
  dir: __dirname,
  search: true,
});

//
// 5. Any default values
//
conf.defaults({
  'if nothing else': 'use this value',
});

console.log(conf.get());
