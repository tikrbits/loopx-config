/*
 * provider-argv.js: Test fixture for using yargs defaults with config.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {Config} from '../../../config';

const config = new Config().argv();

process.stdout.write(config.get('something')!);
