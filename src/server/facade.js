'use strict';

import { Facade } from './../lib/base-facade';

import { Client } from './client';

/**
 * Server Client Facade
 *
 * @class ServerFacade
 */
export default class extends Facade {

  constructor() {
    super();

    this.client = new Client();
  }
}
