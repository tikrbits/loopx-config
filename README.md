# @tib/config

[![Build](https://gitr.net/tibjs/config/badges/master/pipeline.svg)](https://gitr.net/tibjs/config)
[![Coverage](https://gitr.net/tibjs/config/badges/master/coverage.svg)](https://gitr.net/tibjs/config)

> A Hierarchical node.js configuration library with files, environment variables, command-line arguments, and atomic
> object merging. 

## Highlights

This library is mainly modified from [nconf](https://github.com/indexzero/nconf) in typescript. 
Specially add support for yaml, ini and toml formats.

```js
const path = require('path');
const {Config, yaml} = require('@tib/config');

const conf1 = new Config();

// specify the codec
conf1.file({
  file: path.resolve(__dirname, 'config.yml'),
  codec: yaml,
});

console.log(conf1.get());
// => { yaml: { foo: 'bar' } }


const conf2 = new Config();

// auto detect codec
conf2.file({
  file: path.resolve(__dirname, 'config.yml'),
});

console.log(conf1.get());
// => { yaml: { foo: 'bar' } }
```

## Installation
```bash
$ npm install @tib/config --save
```

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

If you run the above script:

```bash
$ NODE_ENV=production sample.js --foo bar
```

The output will be:

```
foo: bar
NODE_ENV: production
database: { host: '127.0.0.1', port: 5984 }
```

## Hierarchical configuration

Configuration management can get complicated very quickly for even trivial applications running in production. `conf` addresses this problem by enabling you to setup a hierarchy for different sources of configuration with no defaults. **The order in which you attach these configuration sources determines their priority in the hierarchy.** Let's take a look at the options available to you

  1. **conf.argv(options)** Loads `process.argv` using yargs. If `options` is supplied it is passed along to yargs.
  2. **conf.env(options)** Loads `process.env` into the hierarchy.
  3. **conf.file(options)** Loads the configuration data at options.file into the hierarchy.
  4. **conf.defaults(options)** Loads the data in options.store into the hierarchy.
  5. **conf.overrides(options)** Loads the data in options.store into the hierarchy.

A sane default for this could be:

```js
  const {conf} = require('@tib/config');

  //
  // 1. any overrides
  //
  conf.overrides({
    'always': 'be this value'
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
    search: true
  });

  //
  // 5. Any default values
  //
  conf.defaults({
    'if nothing else': 'use this value'
  });
```

## API Documentation

The variable `conf` is an instance of the `Config` abstracts this all for you into a simple API.

### conf.add(name, options)
Adds a new store with the specified `name` and `options`. If `options.type` is not set, then `name` will be used instead:

```js
  conf.add('supplied', { type: 'literal', store: { 'some': 'config' });
  conf.add('user', { type: 'file', file: '/path/to/userconf.json' });
  conf.add('global', { type: 'file', file: '/path/to/globalconf.json' });
```

### conf.any(names, callback)
Given a set of key names, gets the value of the first key found to be truthy. The key names can be given as separate arguments
or as an array. If the last argument is a function, it will be called with the result; otherwise, the value is returned.

```js
  //
  // Get one of 'NODEJS_PORT' and 'PORT' as a return value
  //
  var port = conf.any('NODEJS_PORT', 'PORT');

  //
  // Get one of 'NODEJS_IP' and 'IPADDRESS' using a callback
  //
  conf.any(['NODEJS_IP', 'IPADDRESS'], function(err, value) {
    console.log('Connect to IP address ' + value);
  });
```

### conf.use(name, options)
Similar to `conf.add`, except that it can replace an existing store if new options are provided

```js
  //
  // Load a file store onto conf with the specified settings
  //
  conf.use('file', { file: '/path/to/some/config-file.json' });

  //
  // Replace the file store with new settings
  //
  conf.use('file', { file: 'path/to/a-new/config-file.json' });
```

### conf.remove(name)
Removes the store with the specified `name.` The configuration stored at that level will no longer be used for lookup(s).

```js
  conf.remove('file');
```

### conf.required(keys)
Declares a set of string keys to be mandatory, and throw an error if any are missing.

```js
  conf.defaults({
    keya: 'a',
  });

  conf.required(['keya', 'keyb']);
  // Error: Missing required keys: keyb
```
You can also chain `.required()` calls when needed. for example when a configuration depends on another configuration store

```js
conf
  .argv()
  .env()
  .required([ 'STAGE']) //here you should have STAGE otherwise throw an error
  .file( 'stage', path.resolve( 'configs', 'stages', config.get( 'STAGE' ) + '.json' ) )
  .required([ 'OAUTH:redirectURL']) // here you should have OAUTH:redirectURL, otherwise throw an error
  .file( 'oauth', path.resolve( 'configs', 'oauth', config.get( 'OAUTH:MODE' ) + '.json' ) )
  .file( 'app', path.resolve( 'configs', 'app.json' ) )
  .required([ 'LOGS_MODE']) // here you should haveLOGS_MODE, otherwise throw an error
  .add( 'logs', {
    type: 'literal',
    store: require( path.resolve( 'configs', 'logs', config.get( 'LOGS_MODE' ) + '.js') )
  } )
  .defaults( defaults );
```

## Storage Engines

### Memory
A simple in-memory storage engine that stores a nested JSON representation of the configuration. To use this engine, just call `.use()` with the appropriate arguments. All calls to `.get()`, `.set()`, `.clear()`, `.reset()` methods are synchronous since we are only dealing with an in-memory object.

```js
  conf.use('memory');
```

### Argv
Responsible for loading the values parsed from `process.argv` by `yargs` into the configuration hierarchy. See the [yargs option docs](https://github.com/bcoe/yargs#optionskey-opt) for more on the option format.

#### Options

##### `parseValues: {true|false}` (default: `false`)
Attempt to parse well-known values (e.g. 'false', 'true', 'null', 'undefined', '3', '5.1' and JSON values)
into their proper types. If a value cannot be parsed, it will remain a string.

##### `transform: function(obj)`
Pass each key/value pair to the specified function for transformation.

The input `obj` contains two properties passed in the following format:

```js
{
  key: '<string>',
  value: '<string>'
}
```

The transformation function may alter both the key and the value.

The function may return either an object in the same format as the input or a value that evaluates to false.
If the return value is falsey, the entry will be dropped from the store, otherwise it will replace the original key/value.

*Note: If the return value doesn't adhere to the above rules, an exception will be thrown.*

#### Examples

```js
  //
  // Can optionally also be an object literal to pass to `yargs`.
  //
  conf.argv({
    "x": {
      alias: 'example',
      describe: 'Example description for usage generation',
      demand: true,
      default: 'some-value',
      parseValues: true,
      transform: function(obj) {
        if (obj.key === 'foo') {
          obj.value = 'baz';
        }
        return obj;
      }
    }
  });
```

It's also possible to pass a configured yargs instance

```js
  conf.argv(require('yargs')
    .version('1.2.3')
    .usage('My usage definition')
    .strict()
    .options({
      "x": {
        alias: 'example',
        describe: 'Example description for usage generation',
        demand: true,
        default: 'some-value'
      }
    }));
```

### Env
Responsible for loading the values parsed from `process.env` into the configuration hierarchy.
By default, the env variables values are loaded into the configuration as strings.

#### Options

##### `lowerCase: {true|false}` (default: `false`)
Convert all input keys to lower case. Values are not modified.

If this option is enabled, all calls to `conf.get()` must pass in a lowercase string (e.g. `conf.get('port')`)

##### `parseValues: {true|false}` (default: `false`)
Attempt to parse well-known values (e.g. 'false', 'true', 'null', 'undefined', '3', '5.1' and JSON values)
into their proper types. If a value cannot be parsed, it will remain a string.

##### `transform: function(obj)`
Pass each key/value pair to the specified function for transformation.

The input `obj` contains two properties passed in the following format:
```js
{
  key: '<string>',
  value: '<string>'
}
```

The transformation function may alter both the key and the value.

The function may return either an object in the asme format as the input or a value that evaluates to false.
If the return value is falsey, the entry will be dropped from the store, otherwise it will replace the original key/value.

*Note: If the return value doesn't adhere to the above rules, an exception will be thrown.*

#### `readOnly: {true|false}` (defaultL `true`)
Allow values in the env store to be updated in the future. The default is to not allow items in the env store to be updated.

#### Examples

```js
  //
  // Can optionally also be an Array of values to limit process.env to.
  //
  conf.env(['only', 'load', 'these', 'values', 'from', 'process.env']);

  //
  // Can also specify a separator for nested keys (instead of the default ':')
  //
  conf.env('__');
  // Get the value of the env variable 'database__host'
  var dbHost = conf.get('database:host');

  //
  // Can also lowerCase keys.
  // Especially handy when dealing with environment variables which are usually
  // uppercased while argv are lowercased.
  //

  // Given an environment variable PORT=3001
  conf.env();
  var port = conf.get('port') // undefined

  conf.env({ lowerCase: true });
  var port = conf.get('port') // 3001

  //
  // Or use all options
  //
  conf.env({
    separator: '__',
    match: /^whatever_matches_this_will_be_whitelisted/
    whitelist: ['database__host', 'only', 'load', 'these', 'values', 'if', 'whatever_doesnt_match_but_is_whitelisted_gets_loaded_too'],
    lowerCase: true,
    parseValues: true,
    transform: function(obj) {
      if (obj.key === 'foo') {
        obj.value = 'baz';
      }
      return obj;
    }
  });
  var dbHost = conf.get('database:host');
```

### Literal
Loads a given object literal into the configuration hierarchy. Both `conf.defaults()` and `conf.overrides()` use the Literal store.

```js
  conf.defaults({
    'some': 'default value'
  });
```

### File
Based on the Memory store, but provides additional methods `.save()` and `.load()` which allow you to read your configuration to and from file. As with the Memory store, all method calls are synchronous with the exception of `.save()` and `.load()` which take callback functions.

It is important to note that setting keys in the File engine will not be persisted to disk until a call to `.save()` is made. Note a custom key must be supplied as the first parameter for hierarchy to work if multiple files are used.

```js
  conf.file('path/to/your/config.json');
  // add multiple files, hierarchically. notice the unique key for each file
  conf.file('user', 'path/to/your/user.json');
  conf.file('global', 'path/to/your/global.json');
```

The file store is also extensible for multiple file formats, defaulting to `JSON`. To use a custom format, simply pass a format object to the `.use()` method. This object must have `.parse()` and `.stringify()` methods just like the native `JSON` object.

If the file does not exist at the provided path, the store will simply be empty.

#### Encrypting file contents

As of `conf@0.8.0` it is now possible to encrypt and decrypt file contents using the `secure` option:

```js
conf.file('secure-file', {
  file: 'path/to/secure-file.json',
  secure: {
    secret: 'super-secretzzz-keyzz',
    alg: 'aes-256-ctr'
  }
})
```

This will encrypt each key using [`crypto.createCipheriv`](https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_options), defaulting to `aes-256-ctr`. The encrypted file contents will look like this:

```json5
{
  "config-key-name": {
    "alg": "aes-256-ctr", // cipher used
    "value": "af07fbcf",   // encrypted contents
    "iv": "49e7803a2a5ef98c7a51a8902b76dd10" // initialization vector
  },
  "another-config-key": {
    "alg": "aes-256-ctr",   // cipher used
    "value": "e310f6d94f13", // encrypted contents
    "iv": "b654e01aed262f37d0acf200be193985" // initialization vector
  },
}
```


## Run Tests
Tests are written in vows and give complete coverage of all APIs and storage engines.

```bash
$ npm test
```
