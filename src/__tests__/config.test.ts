/*
 * config-test.js: Tests for the config Config object.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import fs from 'fs-extra';
import path from 'path';
import {expect} from '@loopback/testlab';
import {Config} from '../config';
import {assertMerged, assertSystemConf, fixture} from './support';
import {File} from '../stores';

const fixturesDir = path.join(__dirname, 'fixtures');
const mergeFixtures = path.join(fixturesDir, 'merge');
const files = [path.join(mergeFixtures, 'file1.json'), path.join(mergeFixtures, 'file2.json')];
const override = JSON.parse(fs.readFileSync(files[0], 'utf8'));

describe('config When using config', () => {
  describe("an instance of 'Config'", () => {
    it(
      'calling #use() with the same store type and different options' + ' should use a new instance of the store type',
      () => {
        const config = new Config().use('file', {file: files[0]});
        const old = config.stores['file'];

        expect((config.stores.file as File).file).eql(files[0]);
        config.use('file', {file: files[1]});

        expect(old).not.eql(config.stores.file);
        expect((config.stores.file as File).file).eql(files[1]);
      },
    );
  });
  it("respond with correct arg when 'argv' is true", async () => {
    await assertSystemConf({
      script: path.join(fixturesDir, 'scripts', 'config-argv.js'),
      argv: ['--something', 'foobar'],
    });
  });
  it("respond with correct arg when 'env' is true", async () => {
    await assertSystemConf({
      script: path.join(fixturesDir, 'scripts', 'config-env.js'),
      env: {SOMETHING: 'foobar'},
    });
  });

  it("respond with correct arg when 'env' is true and 'parseValues' option is true", () => {
    const env: Record<string, string> = {
      SOMETHING: 'foobar',
      SOMEBOOL: 'true',
      SOMENULL: 'null',
      SOMEUNDEF: 'undefined',
      SOMEINT: '3600',
      SOMEFLOAT: '0.5',
      SOMEBAD: '5.1a',
    };
    const oenv: Record<string, any> = {};
    Object.keys(env).forEach(function (key) {
      if (process.env[key]) oenv[key] = process.env[key];
      process.env[key] = env[key];
    });
    const config = new Config().use('env', {parseValues: true});
    Object.keys(env).forEach(function (key) {
      delete process.env[key];
      if (oenv[key]) process.env[key] = oenv[key];
    });

    expect(config.get('SOMETHING')).eql('foobar');
    expect(config.get('SOMEBOOL')).eql(true);
    expect(config.get('SOMEBOOL')).not.eql('true');
    expect(config.get('SOMENULL')).eql(null);
    expect(config.get('SOMEUNDEF')).eql(undefined);
    expect(config.get('SOMEINT')).eql(3600);
    expect(config.get('SOMEFLOAT')).eql(0.5);
    expect(config.get('SOMEBAD')).eql('5.1a');
  });

  describe('the default config', () => {
    it("respond with correct arg when 'argv' is set to true", async () => {
      await assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'config-argv.js'),
        argv: ['--something', 'foobar'],
        env: {SOMETHING: true},
      });
    });

    it("respond with correct arg when 'env' is set to true", async () => {
      await assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'config-env.js'),
        env: {SOMETHING: 'foobar'},
      });
    });

    it("respond with correct arg when 'argv' is set to true and process.argv is modified", async () => {
      await assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'config-change-argv.js'),
        argv: ['--something', 'badValue', 'evenWorse', 'OHNOEZ', 'foobar'],
      });
    });

    it("respond with correct arg when hierarchical 'argv' get", async () => {
      await assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'config-hierarchical-file-argv.js'),
        argv: ['--something', 'foobar'],
        env: {SOMETHING: true},
      });
    });

    it("respond with correct arg when 'env' is set to true with a nested separator", async () => {
      await assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'config-nested-env.js'),
        env: {SOME_THING: 'foobar'},
      });
    });
  });

  describe('#merge()', () => {
    it('should have the result merged in', async () => {
      const config = new Config().use('file', {file: files[1]});
      await config.load();
      config.merge(override);
      assertMerged(config.stores.file.store);
      expect(config.stores.file.store.candy.something).eql('file1');
    });
    it('should merge Objects over null', async () => {
      const config = new Config().use('file', {file: files[1]});
      await config.load();
      config.merge(override);
      expect(config.stores.file.store.unicorn.exists).eql(true);
    });
  });
  describe('#load()', () => {
    it('should respect the hierarchy when sources are passed in', async () => {
      const config = new Config({
        sources: {
          user: {
            type: 'file',
            file: files[0],
          },
          global: {
            type: 'file',
            file: files[1],
          },
        },
      });
      const merged = await config.load();
      assertMerged(merged);
      expect(merged.candy.something).eql('file1');
    });

    it('should respect the hierarchy when source are passed in', async () => {
      const config = new Config({
        source: {
          type: 'file',
          file: files[0],
        },
      });
      const loaded = await config.load();
      expect(loaded.candy.something).eql('file1');
    });

    it('should respect the hierarchy when multiple stores are used', async () => {
      const config = new Config()
        .overrides({foo: {bar: 'baz'}})
        .add('file1', {type: 'file', file: files[0]})
        .add('file2', {type: 'file', file: files[1]});

      const merged = await config.load();

      assertMerged(merged);
      expect(merged.foo.bar).eql('baz');
      expect(merged.candy.something).eql('file1');
    });
  });
  describe('#loadSync()', () => {
    it('should respect the hierarchy when sources are passed in', () => {
      const config = new Config({
        sources: {
          user: {
            type: 'file',
            file: files[0],
          },
          global: {
            type: 'file',
            file: files[1],
          },
        },
      });
      const merged = config.loadSync();
      assertMerged(merged);
      expect(merged.candy.something).eql('file1');
    });
  });

  describe('#file()', () => {
    it('should use the correct File store with a single filepath', () => {
      const config = new Config();
      config.file(fixture('store.json'));
      expect(config.stores.file).type('object');
    });
    it('should use the correct File store with a name and a filepath', () => {
      const config = new Config();
      config.file('custom', fixture('store.json'));
      expect(config.stores.custom).type('object');
    });
    it('should use the correct File store with a single object', () => {
      const config = new Config();
      config.file({
        dir: fixture(''),
        file: 'store.json',
        search: true,
      });

      expect(config.stores.file).type('object');
      expect((config.stores.file as File).file).eql(fixture('store.json'));
    });
    it('should use the correct File store with a name and an object', () => {
      const config = new Config();
      config.file('custom', {
        dir: fixture(''),
        file: 'store.json',
        search: true,
      });

      expect(config.stores.custom).type('object');
      expect((config.stores.custom as File).file).eql(fixture('store.json'));
    });
  });
  describe('#any()', () => {
    const config = new Config({
      type: 'literal',
      store: {
        key: 'getThisValue',
      },
    });
    it('should respond with the correct value given an array of keys with one matching', () => {
      expect(config.any(['notthis', 'orthis', 'key'])).eql('getThisValue');
    });
    it('should respond with null given an array of keys with no match', () => {
      expect(config.any(['notthis', 'orthis'])).equal(undefined);
    });
    it('should respond with the correct value given a variable argument list of keys with one matching', () => {
      expect(config.any('notthis', 'orthis', 'key')).eql('getThisValue');
    });
    it('should respond with null given no arguments', () => {
      expect(config.any()).equal(undefined);
    });

    it('should respond with an undefined value given an array of keys with no match', () => {
      const value = config.any(['notthis', 'orthis']);
      expect(value).eql(undefined);
    });

    it('should respond with an undefined value given no keys', () => {
      const value = config.any();
      expect(value).eql(undefined);
    });
  });

  describe('#required()', function () {
    const config = new Config({
      type: 'literal',
      store: {
        foo: 'bar',
      },
    });

    it('should pass that keys required exist', function () {
      expect(config.required(['foo'])).ok();
    });

    it('should throw error that keys required not exist', function () {
      expect(() => config.required(['not-exist'])).throw(/Missing required keys:/);
    });
  });
});
