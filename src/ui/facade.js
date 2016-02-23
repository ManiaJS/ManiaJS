/**
 * UI Facade
 */
'use strict';

import * as path from 'path';
import * as async from 'async';

import Facade from './../lib/base-facade';

import UIManager from './ui-manager';
import InterfaceBuilder from './interface';
import GenericInterface from './generic';


/**
 * UI Facade
 *
 * @class UIFacade
 *
 * @property {{}}           interfaces      Interfaces, indexed by player login.
 * @property {UIManager|{}} manager         UI Manager
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    this.manager = new UIManager(app);
    this.generic = new GenericInterface(app);

    this.stack = [];
  }

  /**
   * Prepare Component
   *
   * @return {Promise}
   */
  init() {
    return Promise.resolve();
  }

  /**
   * Run Component
   * @return {Promise}
   */
  run() {
    // Starting, will start the loop for checking and updating UI.
    this.manager.start();

    return Promise.resolve();
  }

  /**
   * Get a builder instance.
   *
   * @param {{}} context Give the plugin class, or app class (for core).
   * @param {string} viewName View File Name.
   * @param {number} [version] Optional manialink version (defaults to 2)
   * @param {string} [idSuffix] Optional unique id suffix.
   */
  build (context, viewName, version, idSuffix) {
    version = version || 2;
    idSuffix = idSuffix || '';

    // Determinate if running from plugin.
    var plugin = false;
    var baseDirectory = __dirname + '/view/';

    if (context.hasOwnProperty('directory')) {
      plugin = context;
      baseDirectory = context.directory + '/view/';
    }

    if (! viewName.endsWith('.hbs')) {
      viewName += '.hbs';
    }

    return new InterfaceBuilder(this.app, this, path.normalize(baseDirectory + viewName), plugin, version, idSuffix);
  }


  /**
   * Prepare List Interface for given column metadata, and given data. To Display, do .display().
   *
   * => Click on column > subscribe on events you provided with the event in columns.
   * => Returning parameter will be the record on that position.
   *
   * When close is called the view will be vanished automatically! But you still need to cleanup your variables!
   * When next/prev is called, the data will be automatically sliced and used. (the events will still be called).
   *
   * @param {string} title Title of list.
   * @param {string} player Player Login (single login!).
   * @param {[{name: {string}, field: {string}, width: {number}, [level]: {number}, [event]: {string}}]} columns Columns to define.
   * @param {[{}]} data Array with objects. Give a custom manialink with the 'custom' key. This will be injected into the row!
   *
   * @returns {InterfaceBuilder|boolean} Interface on success, false on failure!
   */
  list (title, player, columns, data) {
    return this.generic.list(title, player, columns, data);
  }

  /**
   * Prepare and make Alert interface. To display call .display() on the result.
   *
   * @param {string} title Title Text
   * @param {string} message Message Text
   * @param {string[]|string} players Player Logins to display to, empty for all players, single string for only one login
   * @param {string} [size] Size, could be 'sm', 'md' or 'lg'. (small to big). Default 'md'.
   * @param {string} [button] Button text, default 'OK'
   * @param {string} [iconstyle] Icon Style, default 'Icons128x128_1'
   * @param {string} [iconsubstyle] Icon Sub Style, default 'Editor'
   *
   * @returns {InterfaceBuilder} Interface Object, call .display() to display to the login(s).
   */
  alert (title, message, players, size, button, iconstyle, iconsubstyle) {
    return this.generic.alert(title, message, players, size, button, iconstyle, iconsubstyle);
  }

  /**
   * Prepare and make Confirm interface. To display call .display() on the result.
   * To get answer, subscribe on the interface with .once('core_button_yes', function()); or core_button_no
   *
   * @param {string} title Title Text
   * @param {string} message Message Text
   * @param {string[]|string} players Player Logins to display to, empty for all players, single string for only one login
   * @param {string} [size] Size, could be 'sm', 'md' or 'lg'. (small to big). Default 'md'.
   * @param {string} [buttonYes] Button text, default 'Yes'
   * @param {string} [buttonNo] Button text, default 'No'
   * @param {string} [iconstyle] Icon Style, default 'Icons128x128_1'
   * @param {string} [iconsubstyle] Icon Sub Style, default 'Options'
   *
   * @returns {InterfaceBuilder} Interface Object, call .display() to display to the login(s).
   */
  confirm (title, message, players, size, buttonYes, buttonNo, iconstyle, iconsubstyle) {
    return this.generic.confirm(title, message, players, size, buttonYes, buttonNo, iconstyle, iconsubstyle);
  }
}
