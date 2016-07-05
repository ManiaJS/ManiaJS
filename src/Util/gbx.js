'use strict';

import { MapParser } from '@maniajs/gbxparser';

/**
 * Parse Map GBX File.
 *
 * @param {string|Buffer} fd File or Buffer.
 * @param {{thumb: boolean}} [options] Options.
 * @param {boolean|function} [debug] Debug to console.log or custom function?
 *
 * @returns {Promise} Promise with returning map object.
 */
export function parseMap (fd, options, debug) {
  options = options || {};
  debug = debug || false;
  let parser = new MapParser(fd, options);
  if (debug) {
    parser.debug = (typeof debug === 'function' ? debug : console.log);
  }
  return parser.parse(fd);
}
