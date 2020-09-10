/*
 * common.js: Tests for common utility function in
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import fs from 'fs-extra';
import path from 'path';
import * as s from './support';
import {loadFiles, loadFilesSync} from '../utils';

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
});
