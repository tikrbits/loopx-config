/*
 * argv-test.js: Tests for the config argv store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import yargs from 'yargs';
import {Argv} from '../../stores';
import {expect} from '@loopback/testlab';

describe('stores/argv, An instance of Argv', () => {
  it('should have the correct methods defined', () => {
    const argv = new Argv();
    expect(argv.loadSync).type('function');
    expect(argv.loadArgv).type('function');
    expect(argv.options).eql({});
  });

  describe('can be created with a custom yargs', () => {
    const y = yargs.alias('s', 'somearg').default('s', 'false');

    it('and can give access to them', () => {
      const argv = new Argv(y);
      expect(argv.yargs).equal(y);
    });

    it('values are the one from the custom yargv', () => {
      const argv = new Argv(y);
      argv.loadSync();
      expect(argv.get('somearg')).equal('false');
      expect(argv.get('s')).equal('false');
    });
  });

  describe('can be created with a config yargs', () => {
    const options = {somearg: {alias: 's', default: 'false'}};
    it('and can give access to them', () => {
      const argv = new Argv(options);
      expect(argv.options).eql({somearg: {alias: 's', default: 'false'}});
    });

    it('values are the one from the custom yargv', () => {
      const argv = new Argv(options);
      argv.loadSync();
      expect(argv.get('somearg')).equal('false');
      expect(argv.get('s')).equal('false');
    });

    it('values cannot be altered with set when readOnly:true', () => {
      const argv = new Argv(options);
      argv.loadSync();
      argv.set('somearg', 'true');
      expect(argv.get('somearg')).equal('false');
    });
  });
  describe('can be created with readOnly set to be false', () => {
    it('readOnly is actually false', () => {
      const argv = new Argv({readOnly: false});
      expect(argv.readOnly).equal(false);
    });

    it('values can be changed by calling .set', () => {
      const argv = new Argv({somearg: {alias: 's', default: 'false'}, readOnly: false});
      argv.loadSync();
      expect(argv.get('somearg')).equal('false');
      argv.set('somearg', 'true');
      expect(argv.get('somearg')).equal('true');
    });
  });
});
