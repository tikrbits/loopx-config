/*
 * config-hierarchical-load-save.js: Test fixture for using yargs, envvars and a file store with config.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import path from 'path';
import {Config} from '../../../config';

const config = new Config();

//
// Setup config to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at 'path/to/config.json'
//
config
  .argv()
  .env()
  .file({file: path.join(__dirname, '..', 'load-save.json')});

//
// Set a few variables on `config`.
//
config.set('database:host', '127.0.0.1');
config.set('database:port', 5984);

process.stdout.write(config.get('foo')!);
//
// Save the configuration object to disk
//
config.saveSync();
