const path = require('path');
const {Config, yaml} = require('../..');

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
