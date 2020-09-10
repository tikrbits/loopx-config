/*
 * config-nested-env.js: Test fixture for env with nested keys.
 *
 * (C) 2012, Charlie Robbins and the Contributors.
 * (C) 2012, Michael Hart
 *
 */

import {Config} from '../../../config';

const config = new Config().env('_');

process.stdout.write(config.get('SOME:THING')!);
