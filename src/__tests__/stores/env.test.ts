/*
 * env-test.js: Tests for the config env store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {expect} from '@loopback/testlab';
import {Env} from '../../stores';

describe('stores/env, An instance of Env', () => {
  it('should have the correct methods defined', () => {
    const env = new Env();
    assertEnv(env);
  });
  it('should have the correct methods defined and with readOnly false', () => {
    const env = new Env({readOnly: false});
    assertEnv(env);
    expect(env.readOnly).equal(false);
  });
});

export function assertEnv(env: Env) {
  expect(env.loadSync).type('function');
  expect(env.loadEnv).type('function');
  expect(env.whitelist).instanceOf(Array);
  expect(env.whitelist.length).eql(0);
  expect(env.separator).eql('');
}
