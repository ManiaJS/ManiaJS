'use strict';

import { Facade } from './../lib/base-facade';

import { Client } from './client';

/**
 * Database Facade
 *
 * @class DatabaseFacade
 */
export default class extends Facade {

  constructor() {
    super();

    this.client = new Client();
  }
}
