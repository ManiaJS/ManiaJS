'use strict';

import { sprintf } from 'sprintf-js';

/**
 * Get maniaplanet time in string format.
 *
 * @param {number} input
 * @returns {string}
 */
export function stringTime (input) {
  let min = Math.floor(input / (1000 * 60));
  let sec = Math.floor((input - min * 60 * 1000) / 1000);
  let msec = input % 1000;

  if(msec) {
    if(min > 9) {
      return sprintf('%02d:%02d.%03d', min, sec, msec);
    } else {
      return sprintf('%01d:%02d.%03d', min, sec, msec);
    }
  }
  return sprintf('%02d:%02d', min, sec);
}
