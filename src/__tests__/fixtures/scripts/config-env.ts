/*
 * provider-argv.js: Test fixture for using process.env defaults with config.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {Config} from '../../../config';

const provider = new Config().env();

process.stdout.write(provider.get('SOMETHING')!);
