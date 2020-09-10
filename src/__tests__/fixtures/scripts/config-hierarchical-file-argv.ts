/*
 * config-hierarchical-file-argv.js: Test fixture for using yargs defaults and a file store with config.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 * (C) 2011, Sander Tolsma
 *
 */

import path from 'path';
import {Config} from '../../../config';

const config = new Config();

config.argv();
config.add('file', {
  file: path.join(__dirname, '../hierarchy/hierarchical.json'),
});

const data = <string>config.get('something') ?? 'undefined';
process.stdout.write(data);
