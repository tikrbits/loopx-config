/*
 * memory-store-test.js: Tests for the config Memory store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {expect} from '@loopback/testlab';
import {Memory} from '../../stores';
import {fixture} from '../support';

const merge = require('../fixtures/data').merge;

describe('config/stores/memory', () => {
  describe('When using the config memory store', () => {
    const store = new Memory();
    it('the set() method should respond with true', () => {
      expect(store.set({fruit: 'apple'})).true();
      expect(store.set('foo:bar:bazz', 'buzz')).true();
      expect(store.set('falsy:number', 0)).true();
      expect(store.set('falsy:string:empty', '')).true();
      expect(store.set('falsy:string:value', 'value')).true();
      expect(store.set('falsy:boolean', false)).true();
      expect(store.set('falsy:object', null)).true();
    });

    it('the get() method should respond with the correct value', () => {
      expect(store.get('fruit')).eql('apple');
      expect(store.get('foo:bar:bazz')).eql('buzz');
      expect(store.get('falsy:number')).eql(0);
      expect(store.get('falsy:string:empty')).eql('');
      expect(store.get('falsy:string:value')).eql('value');
      expect(store.get('falsy:boolean')).eql(false);
      expect(store.get('falsy:object')).eql(null);
    });

    describe('the get() method should not fail when retrieving non-existent keys', () => {
      it('at the root level', () => {
        expect(store.get('this:key:does:not:exist')).eql(undefined);
      });

      it('within numbers', () => {
        expect(store.get('falsy:number:not:exist')).eql(undefined);
      });

      it('within booleans', () => {
        expect(store.get('falsy:boolean:not:exist')).eql(undefined);
      });

      it('within objects', () => {
        expect(store.get('falsy:object:not:exist')).eql(undefined);
      });

      it('within empty strings', () => {
        expect(store.get('falsy:string:empty:not:exist')).eql(undefined);
      });

      it('within non-empty strings', () => {
        expect(store.get('falsy:string:value:not:exist')).eql(undefined);
      });
    });

    it('the clear() method, should respond with the true', () => {
      expect(store.get('foo:bar:bazz')).eql('buzz');
      expect(store.clear('foo:bar:bazz')).true();
      expect(typeof store.get('foo:bar:bazz') === 'undefined').true();
    });

    describe('the merge() method', () => {
      it('when overriding an existing literal value', () => {
        store.set('merge:literal', 'string-value');
        store.merge('merge:literal', merge);
        expect(store.get('merge:literal')).eql(merge);
      });

      it('when overriding an existing Array value', () => {
        store.set('merge:array', [1, 2, 3, 4]);
        store.merge('merge:array', merge);
        expect(store.get('merge:literal')).eql(merge);
      });

      it('when merging into an existing Object value', () => {
        store.set('merge:object', {
          prop1: 2,
          prop2: 'prop2',
          prop3: {
            bazz: 'bazz',
          },
          prop4: ['foo', 'bar'],
        });
        store.merge('merge:object', merge);

        expect(store.get('merge:object:prop1')).eql(1);
        expect(store.get('merge:object:prop2').length).eql(3);
        expect(store.get('merge:object:prop3')).eql({
          foo: 'bar',
          bar: 'foo',
          bazz: 'bazz',
        });
        expect(store.get('merge:object:prop4').length).eql(2);
      });
    });
  });
  describe('When using the config memory store with different logical separator', () => {
    const store = new Memory({logicalSeparator: '||'});

    it('when storing with : (colon), should store the config atomicly', () => {
      store.set('foo:bar:bazz', 'buzz');
      expect(typeof store.get('foo:bar') === 'undefined').true();
      expect(store.get('foo:bar:bazz')).eql('buzz');
    });

    it('when storing with separator, should be able to read the object', () => {
      store.set('foo||bar||bazz', 'buzz');
      expect(store.get('foo||bar').bazz).eql('buzz');
      expect(store.get('foo').bar.bazz).eql('buzz');
    });
  });

  describe('set', function () {
    it('the set() method should respond with false', () => {
      const store = new Memory();
      expect(store.set('', undefined)).false();
    });

    it('the set() method should override data with empty key', function () {
      const store = new Memory();
      expect(store.set('', {foo: 'bar'})).true();
      expect(store.store).deepEqual({foo: 'bar'});
    });
  });

  describe('Load from file', function () {
    it('should load from file', function () {
      const store = new Memory({loadFrom: fixture('foo.json')});
      expect(store.get('json')).deepEqual({
        foo: 'bar',
      });
    });
  });

  describe('reset()', function () {
    it('should clear all', function () {
      const store = new Memory();
      store.set('foo', 'bar');
      expect(store.store).deepEqual({foo: 'bar'});
      expect(store.reset()).true();
      expect(store.store).deepEqual({});
    });
  });

  describe('readOnly', function () {
    it('should can not modify data if readOnly is true', function () {
      const store = new Memory();
      store.set('foo', 'bar');
      store.readOnly = true;
      expect(store.store).deepEqual({foo: 'bar'});
      expect(store.reset()).false();
      expect(store.set('foo', 'hello')).false();
      expect(store.merge('foo', 'world')).false();
      expect(store.clear('foo')).false();
      expect(store.store).deepEqual({foo: 'bar'});
    });
  });
});
