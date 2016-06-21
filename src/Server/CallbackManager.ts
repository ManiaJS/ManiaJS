/**
 * Callback Manager for the GBX Client.
 *
 * Abstract away the ManiaPlanet callbacks.
 */
'use strict';

import {App} from './../App';
import {Client, Game} from './Client';
import {Server} from './index';

import {legacy as ManiaPlanetLegacyCalls, script as ManiaPlanetScriptCalls} from './callbacks/ManiaPlanetCallbacks';
import {legacy as TrackManiaLegacyCalls,  script as TrackManiaScriptCalls} from './callbacks/TrackManiaCallbacks';
import {legacy as ShootManiaLegacyCalls,  script as ShootManiaScriptCalls} from './callbacks/ShootManiaCallbacks';

export interface CallbackOptions {
  callback: string;
  event: string | string[];
  parameters?: {[s: string]: number};

  game?: Game[];
  type?: CallbackType;

  flow? (app: App, params: any): Promise<any>;
  pass? (params: any): boolean;
  parse? (raw: any): any;
}

export enum CallbackType {
  native,
  scripted
}

/**
 * CallbackManager
 * @class CallbackManager
 * @type {CallbackManager}
 */
export class CallbackManager {

  private app: App;
  private client: Client;

  private prepared: boolean; // Is script client prepared?

  constructor(facade: Server.Facade) {
    this.app = facade.app;
    this.client = facade.client;
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
   *
   * @param {function} options.flow Optional promise returning funciton for controlling the game flow. Calls with first parameter app and second params.
   */
  public register(options: CallbackOptions) {
    let callbackName = options.callback;
    let eventName = options.event;
    let parameters = options.parameters || {};

    let parse = options.parse;
    let pass = options.pass;
    let flow = options.flow;

    let type = options.type || CallbackType.native;
    let game = options.game || []; // Default all games

    // Register callback, make it an event.
    this.client.gbx.on(callbackName, (rawParams) => {
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
        params = Object.assign({}, parameters);
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

      // Maybe we want to pass it to the game flow manager before we want to give
      // the event to the plugins and core (for player connect for example).
      if (typeof flow !== 'function') {
        flow = () => Promise.resolve();
      }

      // Promise the flow.
      flow(this.app, params)
        .then(() => {
          if (! Array.isArray(eventName)) eventName = [(eventName as string)];

          (eventName as string[]).forEach((event) => {
            // Debug convert to event
            if (this.app.config.config.debug) {
              this.app.log.debug(`'${callbackName}' ==> '${event}'. ! Emitting..`);
            }

            // Trigger the event on our client
            this.client.emit(event, params);
          });
        })
        .catch((err) => {
          this.app.log.warn(err.stack);
        });
    });
  }


  /**
   * Load Set from specific prefixed sets.
   *
   * @param {string} name For example: 'maniaplanet'.
   * @param {boolean} script Is scripted?
   */
  public loadSet(name: string, script: boolean) {
    if (script && ! this.prepared)
      this.prepareScriptedCallbacks();

    switch(name) {
      case 'maniaplanet': script ? ManiaPlanetScriptCalls(this) : ManiaPlanetLegacyCalls(this); break;
      case 'trackmania' : script ? TrackManiaScriptCalls(this)  : TrackManiaLegacyCalls(this);  break;
      case 'shootmania' : script ? ShootManiaScriptCalls(this)  : ShootManiaLegacyCalls(this);  break;

      default: return;
    }
  }

  /**
   * Prepare by registering the modescript callbacks to myself.
   */
  private prepareScriptedCallbacks() {
    this.prepared = true;
    this.client.gbx.on('ManiaPlanet.ModeScriptCallback', (rawParams) => {
      this.client.gbx.emit(rawParams[0], [rawParams[1]]);
    });
    this.client.gbx.on('ManiaPlanet.ModeScriptCallbackArray', (rawParams) => {
      this.client.gbx.emit(rawParams[0], rawParams[1]);
    });
  }
}
