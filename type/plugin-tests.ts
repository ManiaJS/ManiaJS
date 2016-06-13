/// <reference path="./maniajs.d.ts" />

import {BasePlugin} from '@maniajs/plugin';

export default class extends BasePlugin {
  constructor() {
    super();

    this.name = 'test-plugin';
    this.version = '1.0.0';
    this.directory = './'; // Should be __dirname or somehting. Relative to the plugin.js/ts.

    this.author = [
      {name: 'okay'}
    ];

    this.game.games = ['trackmania'];
    this.game.modes = [0];
  }

  public async init() {
    this.app.log.debug('Plugin interface okay');
    return;
  }
}
