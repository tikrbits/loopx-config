/*
 * literal-test.js: Tests for the config literal store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {expect} from '@loopback/testlab';
import {Literal} from '../../stores';

describe('config/stores/literal, An instance of config.Literal', () => {
  const envOptions = {foo: 'bar', one: 2};
  it('should have the correct methods defined', () => {
    const literal = new Literal(envOptions);
    expect(literal.type).eql('literal');
    expect(literal.get).type('function');
    expect(literal.set).type('function');
    expect(literal.merge).type('function');
    expect(literal.loadSync).type('function');
  });
  it('should have the correct values in the store', () => {
    const literal = new Literal(envOptions);
    expect(literal.store.foo).eql('bar');
    expect(literal.store.one).eql(2);
  });
});
