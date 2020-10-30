/*
 * common.js: Tests for common utility function in
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import fs from 'fs-extra';
import path from 'path';
import * as s from './support';
import {loadFiles, loadFilesSync, traverse, traverseSync} from '../utils';
import {expect} from '@loopback/testlab';

const mergeDir = path.join(__dirname, 'fixtures', 'merge');
const files = fs.readdirSync(mergeDir).map(function (f) {
  return path.join(mergeDir, f);
});

describe('config/common', () => {
  describe('Using common module', () => {
    it('the loadFiles() method should merge the files correctly', async () => {
      s.assertMerged(await loadFiles(files));
    });
    it('the loadFilesSync() method should merge the files correctly', () => {
      s.assertMerged(loadFilesSync(files));
    });
  });

  describe('#traverse()', function () {
    it('should find target', async function () {
      type Item = {
        name: string;
        price: () => Promise<number>;
      };
      const obj: {[name: string]: Item} = {
        a: {
          name: 'apple',
          price: async () => 8.9,
        },
        b: {
          name: 'banana',
          price: async () => 9.6,
        },
      };
      const result = await traverse(obj, async item => {
        if (item.name === 'banana') {
          return item.price();
        }
      });
      expect(result).equal(9.6);
    });
  });

  describe('#traverseSync()', function () {
    it('should find target', async function () {
      type Item = {
        name: string;
        price: number;
      };
      const obj: {[name: string]: Item} = {
        a: {
          name: 'apple',
          price: 8.9,
        },
        b: {
          name: 'banana',
          price: 9.6,
        },
      };
      const result = traverseSync(obj, item => {
        if (item.name === 'banana') {
          return item.price;
        }
      });
      expect(result).equal(9.6);
    });
  });
});
