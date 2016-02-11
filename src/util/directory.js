
'use strict';

import * as fs from 'fs';
import * as path from 'path';

export function rootPath() {
  return path.normalize(__dirname + "/../../");
}

export function srcPath() {
  return path.normalize(__dirname + "/../");
}

export function pluginsPath() {
  return path.normalize(__dirname + "/../../plugins/");
}

export let sep = path.sep;
