/*
 * config-change-argv.js: Test fixture for changing argv on the fly
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {Config} from '../../../config';
import {Argv} from '../../../stores';

const config = new Config().argv();

//
// Remove 'badValue', 'evenWorse' and 'OHNOEZ'
//
process.argv.splice(3, 3);
(config.stores['argv'] as Argv).loadArgv();
process.stdout.write(config.get('something')!);
