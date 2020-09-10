/*
 * hierarchy-test.js: Basic tests for hierarchical file stores.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import fs from 'fs-extra';
import path from 'path';
import {expect} from '@tib/testlab';
import {Config} from '../config';
import execa from 'execa';

const configDir = path.join(__dirname, 'fixtures', 'hierarchy');
const globalConfig = path.join(configDir, 'global.json');
const userConfig = path.join(configDir, 'user.json');

describe('config/hierarchy, When using config', () => {
  const config = new Config();

  it('configured with two file stores, should have the appropriate keys present', async () => {
    config.add('user', {type: 'file', file: userConfig});
    config.add('global', {type: 'file', file: globalConfig});
    await config.load();

    expect(config.get('title')).eql('My specific title');
    expect(config.get('color')).eql('green');
    expect(config.get('movie')).eql('Kill Bill');
  });
  it('configured with two file stores using `file` should have the appropriate keys present', async () => {
    config.file('user', userConfig);
    config.file('global', globalConfig);
    await config.load();

    expect(config.get('title')).eql('My specific title');
    expect(config.get('color')).eql('green');
    expect(config.get('movie')).eql('Kill Bill');
  });

  it('configured with .argv(), .env() and .file() should not persist information passed in to process.env and process.argv to disk', async () => {
    const configFile = path.join(__dirname, 'fixtures', 'load-save.json');
    const script = path.join(__dirname, 'fixtures', 'scripts', 'config-hierarchical-load-save.js');
    const argv = ['--foo', 'foo', '--bar', 'bar'];

    try {
      fs.unlinkSync(configFile);
    } catch (ex) {
      // no-op
    }

    const {stdout} = await execa('node', [script].concat(argv));
    const data = await fs.readFile(configFile, 'utf8');
    expect(stdout).eql('foo');
    expect(JSON.parse(data)).eql({
      database: {
        host: '127.0.0.1',
        port: 5984,
      },
    });
  });

  it('configured with .argv(), .file() and invoked with nested command line options, should merge nested objects', async () => {
    const script = path.join(__dirname, 'fixtures', 'scripts', 'config-hierarchical-load-merge.js');
    const argv = ['--candy:something', 'foo', '--candy:something5:second', 'bar'];

    const {stdout} = await execa('node', [script].concat(argv));
    expect(JSON.parse(stdout)).eql({
      apples: true,
      candy: {
        something: 'foo',
        something1: true,
        something2: true,
        something5: {
          first: 1,
          second: 'bar',
        },
      },
    });
  });
  it('configured with .argv() and separator, .file() and invoked with nested command line options should merge nested objects', async () => {
    const script = path.join(__dirname, 'fixtures', 'scripts', 'config-hierarchical-load-merge-with-separator.js');
    const argv = ['--candy--something', 'foo', '--candy--something5--second', 'bar'];
    process.env.candy__bonbon = 'sweet';
    const {stdout} = await execa('node', [script].concat(argv), {env: process.env});
    delete process.env.candy__bonbon;
    // console.log(stdout);
    expect(JSON.parse(stdout)).eql({
      apples: true,
      candy: {
        bonbon: 'sweet',
        something: 'foo',
        something1: true,
        something2: true,
        something5: {
          first: 1,
          second: 'bar',
        },
      },
    });
  });

  it('configured with .file(), .defaults() should deep merge objects should merge nested objects ', async () => {
    const script = path.join(__dirname, 'fixtures', 'scripts', 'config-hierarchical-defaults-merge.js');
    const {stdout} = await execa('node', [script]);

    expect(JSON.parse(stdout)).eql({
      candy: {
        something: 'much better something for you',
        something1: true,
        something2: true,
        something18: 'completely unique',
        something5: {
          first: 1,
          second: 99,
        },
      },
    });
  });
});
