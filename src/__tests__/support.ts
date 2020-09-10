/*
 * helpers.ts: Test helpers for
 *
 * (C) 2020, Yvan Tao
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import fs from 'fs-extra';
import path from 'path';
import {expect} from '@tib/testlab';
import execa from 'execa';
import {Store} from '../store';

export function assertMerged(target: Store | Record<string, any>) {
  const merged = target.store ?? target;

  expect(merged).type('object');
  expect(merged.apples).ok();
  expect(merged.bananas).ok();
  expect(merged.candy).type('object');
  expect(merged.candy.something1).ok();
  expect(merged.candy.something2).ok();
  expect(merged.candy.something3).ok();
  expect(merged.candy.something4).ok();
  expect(merged.dates).ok();
  expect(merged.elderberries).ok();
}

//FIXME TODO
export async function assertSystemConf(options: {script: string; argv?: string[]; env?: Record<string, any>}) {
  const env: Record<string, any> = {};

  if (options?.env) {
    Object.keys(process.env).forEach(function (key) {
      env[key] = process.env[key];
    });

    Object.keys(options.env).forEach(function (key) {
      env[key] = options.env![key];
    });
  }

  const {stdout} = await execa('node', [options.script, ...(options.argv ?? [])], {env});
  expect(stdout.toString()).equal('foobar');
}

// copy a file
export function cp(from: string, to: string) {
  return fs.copyFileSync(from, to);
}

export function fixture(file: string) {
  return path.join(__dirname, 'fixtures', file);
}
