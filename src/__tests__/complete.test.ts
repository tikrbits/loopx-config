/*
 * complete-test.js: Complete test for multiple stores.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import fs from 'fs-extra';
import {expect} from '@tib/testlab';
import {cp, fixture} from './support';
import {Config} from '../config';

const sample = require('./fixtures/data').data;

const completeTest = fixture('complete-test.json');
const complete = fixture('complete.json');

// prime the process.env
process.env['NCONF_foo'] = 'bar';
process.env.FOO = 'bar';
process.env.BAR = 'zalgo';
process.env.NODE_ENV = 'debug';
process.env.FOOBAR = 'should not load';
process.env.json_array = JSON.stringify(['foo', 'bar', 'baz']);
process.env.json_obj = JSON.stringify({foo: 'bar', baz: 'foo'});
process.env.NESTED__VALUE = 'nested';
process.env.NESTED___VALUE_EXTRA_LODASH = '_nested_';

describe('config/multiple-stores', () => {
  const config = new Config();

  describe('When using the config with multiple providers', () => {
    before(() => {
      cp(complete, completeTest);
      config.env({
        // separator: '__',
        match: /^NCONF_/,
        whitelist: ['NODE_ENV', 'FOO', 'BAR'],
      });
      config.file({file: completeTest});
      config.use('argv', {type: 'literal', store: sample});
    });

    after(() => {
      if (fs.existsSync(completeTest)) fs.unlinkSync(completeTest);
      config.remove('file');
      config.remove('memory');
      config.remove('argv');
      config.remove('env');
    });

    it('should have the correct `stores`', () => {
      expect(config.stores.env).type('object');
      expect(config.stores.argv).type('object');
      expect(config.stores.file).type('object');
    });
    it('env consts, are present', () => {
      ['NODE_ENV', 'FOO', 'BAR', 'NCONF_foo'].forEach(function (key) {
        expect(config.get(key)).eql(process.env[key]);
      });
    });
    it('json consts are present', async () => {
      const data = await fs.readJson(complete);
      Object.keys(data).forEach(function (key) {
        expect(config.get(key)).eql(data[key]);
      });
    });
    it('literal consts are present', () => {
      Object.keys(sample).forEach(function (key) {
        expect(config.get(key)).eql(sample[key]);
      });
    });
    describe('saving', () => {
      afterEach(() => {
        // remove the file so that we can test saving it async
        fs.unlinkSync(completeTest);
      });
      it('and saving *synchronously* correct return value, the file, saved correctly', async () => {
        config.set('weebls', 'stuff');
        const topic = await config.save();
        Object.keys(topic).forEach(function (key) {
          expect(topic[key]).eql(config.get(key));
        });

        const data = await fs.readJson(completeTest);
        Object.keys(data).forEach(function (key) {
          expect(data[key]).eql(config.get(key));
        });
        expect(config.get('weebls')).eql('stuff');
      });
      it('and saving *asynchronously* correct return value, the file, saved correctly', async () => {
        config.set('weebls', 'crap');
        let data = await config.save();
        Object.keys(data).forEach(function (key) {
          expect(data[key]).eql(config.get(key));
        });

        data = await fs.readJson(completeTest);
        Object.keys(data).forEach(function (key) {
          expect(data[key]).eql(config.get(key));
        });
        expect(config.get('weebls')).eql('crap');
      });
    });
  });
  describe('When using the config env with custom options', () => {
    describe('When using env with lowerCase:true', () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      before(() => {
        cp(complete, completeTest);
        config.env({lowerCase: true});
      });

      after(() => config.remove('env'));

      it('env consts keys also available as lower case', () => {
        Object.keys(process.env).forEach(function (key) {
          expect(config.get(key.toLowerCase())).eql(process.env[key]);
        });
      });
    });

    describe('When using env with parseValues:true', () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      before(() => {
        cp(complete, completeTest);
        config.env({parseValues: true});
      });
      after(() => config.remove('env'));
      it('JSON keys properly parsed', () => {
        Object.keys(process.env).forEach(function (key) {
          let val = <string>process.env[key];

          try {
            val = JSON.parse(val.toString());
          } catch (err) {
            //
          }

          expect(config.get(key)).eql(val);
        });
      });
    });

    describe('When using env with transform:fn', () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      before(() => {
        function testTransform(obj: any) {
          if (obj.key === 'FOO') {
            obj.key = 'FOOD';
            obj.value = 'BARFOO';
          }

          return obj;
        }

        cp(complete, completeTest);
        config.env({transform: testTransform});
      });

      after(() => config.remove('env'));

      it('env consts port key/value properly transformed', () => {
        expect(config.get('FOOD')).eql('BARFOO');
      });
    });
    describe('When using env with transform:fn that drops an entry', () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      before(() => {
        function testTransform(obj: any) {
          if (obj.key === 'FOO') {
            return false;
          }

          return obj;
        }

        cp(complete, completeTest);
        config.env({transform: testTransform});
      });

      after(() => config.remove('env'));

      it('env consts port key/value properly transformed', () => {
        expect(config.get('FOO')).equal(undefined);
      });
    });

    describe('When using env with transform:fn that return an undefined value', () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      before(() => {
        function testTransform(obj: any) {
          if (obj.key === 'FOO') {
            return {key: 'FOO', value: undefined};
          }
          return obj;
        }

        cp(complete, completeTest);
        config.env({transform: testTransform});
      });

      after(() => config.remove('env'));

      it('env consts port key/value properly transformed', () => {
        expect(config.get('FOO')).equal(undefined);
      });
    });

    describe('When using env with bad transform:fn', () => {
      after(() => config.remove('env'));

      // Threw this in it's own batch to make sure it's run separately from the sync check
      it(' port key/value throws transformation error', () => {
        function testTransform() {
          return {foo: 'bar'};
        }

        cp(complete, completeTest);
        try {
          config.env({transform: testTransform});
        } catch (err) {
          expect(err.name).eql('RuntimeError');
        }
      });
    });

    describe('When using env with a separator', () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      before(() => {
        cp(complete, completeTest);
        config.env({separator: /__+/});
      });

      after(() => config.remove('env'));

      it('can access to nested values', () => {
        expect(config.get('NESTED')).eql({VALUE: 'nested', VALUE_EXTRA_LODASH: '_nested_'});
      });
    });
  });
});
