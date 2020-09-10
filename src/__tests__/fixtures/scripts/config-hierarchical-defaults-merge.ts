import path from 'path';
import {Config} from '../../../config';

const config = new Config();

config.file('localOverrides', path.join(__dirname, '..', 'merge', 'file3.json')).defaults({
  candy: {
    something: 'a nice default',
    something1: true,
    something2: true,
    something5: {
      first: 1,
      second: 2,
    },
  },
});

process.stdout.write(
  JSON.stringify({
    candy: config.get('candy'),
  }),
);
