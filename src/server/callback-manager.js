/**
 * Callback Manager for the GBX Client.
 *
 * Abstract away the ManiaPlanet callbacks.
 */
'use strict';

import * as util from 'util';

import ManiaPlanetCalls from './callbacks/maniaplanet-callbacks';

/**
 * CallbackManager
 * @class CallbackManager
 */
export default class {

  /**
   * @param {ServerClient} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Register a GBX callback, make it a normal event.
   *
   * @param {object} options Provide gbx and event details.
   * @param {string} options.callback Callback name that will be fired by the GBX Client.
   * @param {string} options.event Converting into event name.
   * @param {string} options.type Type of callback, could be 'native' or 'scripted'. Native is default.
   * @param {object} options.parameters Parameters mapping.
   * @param {function} options.parse Custom parse mapping function.
   * @param {function} options.pass Custom pass function. Optional! Give false as return to ignore the callback!
   * @param {object} options.game Optional game strings. Provide the titleid of the parent title (the game title).
   */
  register(options) {
    let self = this;

    let callbackName = options.callback;
    let eventName = options.event;
    let parameters = options.parameters || {};

    let parse = options.parse;
    let pass = options.pass;

    let type = options.type || 'native';
    let game = options.game || []; // Default all games

    // Register callback, make it an event.
    this.client.gbx.on(callbackName, function(rawParams) {
      // Output var
      var params = {};

      // Check if we can continue first.
      if (typeof pass === 'function') {
        if (pass(rawParams) === false) {
          // Skip
          return;
        }
      }

      // If we have custom parser, then call it, if not we go with the mapping.
      if (typeof parse === 'function') {
        params = parse(rawParams);
      } else {
        params = util._extend({}, parameters); // (clone it).
        let paramKeys = Object.keys(parameters);

        for (var i = 0; i < paramKeys.length; i++) {
          let key = paramKeys[i];
          let num = parameters[paramKeys[i]];

          // Do we have that num in our rawParams?
          if (num < rawParams.length) {
            // Allrighty!
            // Map it.
            params[key] = rawParams[num];
          }
        }
      }

      // Trigger the event on our client
      self.client.emit(eventName, params);
    });

  }


  /**
   * Load Set from specific prefixed sets.
   *
   * @param {string} name For example: 'maniaplanet'
   */
  loadSet(name) {
    switch(name) {
      case 'maniaplanet': ManiaPlanetCalls(this); break;

      default: return;
    }
  }
}
