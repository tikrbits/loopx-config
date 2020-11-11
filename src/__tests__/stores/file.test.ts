/*
 * file-store-test.js: Tests for the config File store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import fs from 'fs-extra';
import path from 'path';
import {expect} from '@loopback/testlab';
import tmp, {DirResult} from 'tmp';
import {File} from '../../stores';
import {json5, yaml} from '../../codecs';
import {MissingRequiredCodec} from '../mocks/missing-required-codec';

const sample = require('../fixtures/data').data;

describe('stores/file', () => {
  let dir: DirResult;

  before(() => {
    dir = tmp.dirSync();
  });

  after(() => {
    fs.removeSync(dir.name);
  });

  describe('load', () => {
    describe('with a valid JSON file', () => {
      let file: string;

      beforeEach(() => {
        file = `${dir.name}/sample.json`;
        fs.writeFileSync(file, JSON.stringify(sample, null, 2));
      });

      afterEach(() => {
        fs.removeSync(file);
      });

      it('the load() method should load the data correctly', async () => {
        const store = new File({file});
        expect(await store.load()).eql(sample);
      });
    });

    describe('with a valid JSON5 file', function () {
      let file: string;

      beforeEach(() => {
        file = `${dir.name}/sample.json5`;
        fs.writeFileSync(file, json5.encode(sample));
      });

      afterEach(() => {
        fs.removeSync(file);
      });

      it('the load() method should load the data correctly', async () => {
        const store = new File({file});
        expect(await store.load()).eql(sample);
      });
    });

    describe('with a valid Yaml file', function () {
      let file: string;

      beforeEach(() => {
        file = `${dir.name}/sample.yaml`;
        fs.writeFileSync(file, yaml.encode(sample));
      });

      afterEach(() => {
        fs.removeSync(file);
      });

      it('the load() method should load the data correctly', async () => {
        const store = new File({file});
        expect(await store.load()).eql(sample);
      });
    });

    describe('with a malformed JSON file', () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'malformed.json');

      it('the load() method with a malformed JSON config file, should respond with an error and indicate file name', async () => {
        const store = new File({file: filePath});
        await expect(store.load()).rejectedWith(/malformed\.json/);
      });
    });

    describe('with a valid UTF8 JSON file that contains a BOM', () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'bom.json');
      const store = new File({file: filePath});

      it('the load() method should load the data correctly', async () => {
        expect(await store.load()).eql(store.store);
      });
      it('the loadSync() method should load the data correctly', () => {
        const data = store.loadSync();
        expect(store.store).eql(data);
      });
    });
    describe('with a valid UTF8 JSON file that contains no BOM', () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'no-bom.json');
      const store = new File({file: filePath});

      it('the load() method should load the data correctly', async () => {
        expect(await store.load()).eql(store.store);
      });
      it('the loadSync() method should load the data correctly', () => {
        const data = store.loadSync();
        expect(data).eql(store.store);
      });
    });

    describe('with codec missing requires', function () {
      it('should throw CodecRequiresMissingError error', function () {
        expect(() => new File({file: 'sample.mrc', codec: new MissingRequiredCodec()})).throw(
          /are not found that required by/,
        );
      });
    });
  });

  describe('save', () => {
    const tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json');

    it('the save() method should save the data correctly', async () => {
      const tmpStore = new File({file: tmpPath});

      Object.keys(sample).forEach(function (key) {
        tmpStore.set(key, sample[key]);
      });

      await tmpStore.save();
      const d = await fs.readFile(tmpStore.file);
      fs.unlinkSync(tmpStore.file);
      expect(JSON.parse(d.toString())).eql(sample);
    });
    it('the saveToFile() method should save the data correctly', async () => {
      const tmpStore = new File({file: tmpPath});
      const pathFile = path.join(__dirname, '..', 'fixtures', 'tmp-save-tofile.json');

      Object.keys(sample).forEach(function (key) {
        tmpStore.set(key, sample[key]);
      });

      await tmpStore.saveToFile(pathFile);
      const d = await fs.readFile(pathFile);
      fs.unlinkSync(pathFile);
      expect(JSON.parse(d.toString())).eql(sample);
    });
    it('the saveToFile() method with custom format should save the data correctly', async () => {
      const tmpStore = new File({file: tmpPath});
      const pathFile = path.join(__dirname, '..', 'fixtures', 'tmp-save-tofile.yaml');

      Object.keys(sample).forEach(function (key) {
        tmpStore.set(key, sample[key]);
      });

      await tmpStore.saveToFile(pathFile, yaml);
      const d = await fs.readFile(pathFile);
      fs.unlinkSync(pathFile);
      expect(yaml.decode(d.toString())).eql(sample);
    });
  });

  describe('save sync', () => {
    const tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json');
    it('the saveSync() method should save the data correctly', async () => {
      const tmpStore = new File({file: tmpPath});
      Object.keys(sample).forEach(function (key) {
        tmpStore.set(key, sample[key]);
      });

      const saved = tmpStore.saveSync();
      const d = await fs.readFile(tmpStore.file);
      fs.unlinkSync(tmpStore.file);
      const read = JSON.parse(d.toString());
      expect(read).eql(sample);
      expect(read).eql(saved);
    });
  });
  describe('set/get/clear', () => {
    const tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json');
    const store = new File({file: tmpPath});

    it('the set() method should respond with true', () => {
      expect(store.set('foo:bar:bazz', 'buzz')).true();
      expect(store.set('falsy:number', 0)).true();
      expect(store.set('falsy:string', '')).true();
      expect(store.set('falsy:boolean', false)).true();
      expect(store.set('falsy:object', null)).true();
    });
    it('the get() method should respond with the correct value', () => {
      expect(store.get('foo:bar:bazz')).eql('buzz');
      expect(store.get('falsy:number')).eql(0);
      expect(store.get('falsy:string')).eql('');
      expect(store.get('falsy:boolean')).eql(false);
      expect(store.get('falsy:object')).eql(null);
    });
    it('the clear() method should respond with the true', () => {
      expect(store.get('foo:bar:bazz')).eql('buzz');
      expect(store.clear('foo:bar:bazz')).true();
      expect(typeof store.get('foo:bar:bazz') === 'undefined').true();
    });
  });
  describe('search', () => {
    it('the search() method when the target file exists higher in the directory tree should update the file appropriately', () => {
      const filePath = path.join(dir.name, '.config');
      fs.writeFileSync(filePath, JSON.stringify(sample, null, 2));
      const store = new File({
        file: '.config',
      });
      store.search(dir.name);
      expect(store.file).eql(filePath);
      fs.unlinkSync(filePath);
    });

    it("the search() method when the target file doesn't exist higher in the directory tree should update the file appropriately", () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'search-store.json');
      const store = new File({
        dir: path.dirname(filePath),
        file: 'search-store.json',
      });
      store.search();
      expect(store.file).eql(filePath);
    });
  });
  describe('secure 1', () => {
    const secureStore = new File({
      file: path.join(__dirname, '..', 'fixtures', 'secure-iv.json'),
      secure: 'super-secret-key-32-characterszz',
    });

    (secureStore as any)._store = sample;

    it('the encode() method should encrypt properly', () => {
      const contents = JSON.parse(secureStore.encode());
      Object.keys(sample).forEach(key => {
        expect(typeof contents[key]).equal('object');
        expect(typeof contents[key].value).equal('string');
        expect(contents[key].alg).eql('aes-256-ctr');
        expect(typeof contents[key].iv).equal('string');
      });
    });
    it('the decode() method should decrypt properly', () => {
      const contents = secureStore.encode();
      const parsed = secureStore.decode(contents);
      expect(parsed).eql(sample);
    });
    it('the load() method should decrypt properly', async () => {
      const loaded = await secureStore.load();
      expect(loaded).eql(sample);
    });
    it('the loadSync() method should decrypt properly', () => {
      const loaded = secureStore.loadSync();
      expect(loaded).eql(sample);
    });
  });

  describe('secure 2', () => {
    const secureStore = new File({
      file: path.join(__dirname, '..', 'fixtures', 'secure.json'),
      secure: 'super-secretzzz',
    });

    it('the load() method should decrypt legacy file properly', async () => {
      await expect(secureStore.load()).rejectedWith(/"iv" is required/);
    });
    it('the loadSync() method should decrypt legacy file properly', () => {
      expect(() => secureStore.loadSync()).throw(/"iv" is required/);
    });
  });
});
