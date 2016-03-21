/**
 * ManiaJS Generic GUI Elements.
 */
'use strict';

import ListView from './generic/listview';

/**
 * Generic Interface Helper.
 *
 * @class GenericInterface
 * @type {GenericInterface}
 */
export default class GenericInterface {

  constructor (app, facade) {
    this.app = app;
    this.facade = facade;
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
   * @returns {ListView|boolean} ListView on success, false on failure!
   */
  list (title, player, columns, data) {
    player = this.app.gameFacade.players.list[player] || false;
    if (! player) return false;

    let view = new ListView(this.app, title, player, columns, data);
        view.parse();
    return view;
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
  alert(title, message, players, size, button, iconstyle, iconsubstyle) {
    if (typeof players === 'string') {
      players = [players];
    }
    let buttonText = {
      ok: button || 'OK'
    };
    return this._createAlert('alert', title, message, players, size, buttonText, iconstyle, iconsubstyle);
  }

  /**
   * Prepare and make Confirm interface. To display call .display() on the result.
   * To get answer, subscribe on the interface with .once('yes', function()); or 'no'
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
  confirm(title, message, players, size, buttonYes, buttonNo, iconstyle, iconsubstyle) {
    if (typeof players === 'string') {
      players = [players];
    }
    let buttonText = {
      yes: buttonYes || 'Yes',
      no:  buttonNo  || 'No'
    };
    return this._createAlert('confirm', title, message, players, size, buttonText, iconstyle, iconsubstyle);
  }

  /**
   * Private helper. Create alert (alert/confirm)
   *
   * @private
   * @param {string} type Could be alert or confirm.
   * @param {string} title Title.
   * @param {string} message Message.
   * @param {string[]} players Player Logins.
   * @param {string} [size] Size, 'sm'/'md'/'lg'. md is default.
   * @param {object} [buttonText] Button text.
   * @param {string} [buttonText.yes]
   * @param {string} [buttonText.no]
   * @param {string} [buttonText.ok]
   * @param {string} [iconstyle]
   * @param {string} [iconsubstyle]
   *
   * @returns {InterfaceBuilder}
   */
  _createAlert(type, title, message, players, size, buttonText, iconstyle, iconsubstyle) {
    if (typeof players === 'string') {
      players = [players];
    }
    buttonText.yes = buttonText.yes || 'Yes';
    buttonText.no = buttonText.no   || 'No';
    buttonText.ok = buttonText.ok   || 'OK';

    let actions = {
      yes: 'core_button_yes',
      no: 'core_button_no',
      ok: 'core_button_ok'
    };
    iconstyle = iconstyle || 'Icons128x128_1';
    iconsubstyle = iconsubstyle || 'Editor';
    size = size || 'md';

    let sizes = {boxWidth: 150, boxHeight: 75, barLeft: -75, barTop: 27};
    switch (size) {
      case 'sm':
        sizes.boxWidth = 100; sizes.boxHeight = 50;
        sizes.barLeft = -50; sizes.barTop = 15; break;
      case 'md':
        sizes.boxWidth = 150; sizes.boxHeight = 75;
        sizes.barLeft = -75 ; sizes.barTop = 27; break;
      case 'lg':
        sizes.boxWidth = 200; sizes.boxHeight = 100;
        sizes.barLeft = -100; sizes.barTop = 40; break;
    }
    sizes.iconTop = (sizes.boxHeight / 2) - 1;
    sizes.iconLeft = -((sizes.boxWidth / 2) - 3);
    sizes.titleTop = (sizes.boxHeight / 2) - 3;
    sizes.messageLeft = -((sizes.boxWidth / 2) - 9);
    sizes.messageTop = ((sizes.boxHeight) / 2 - 17);
    sizes.messageWidth = sizes.boxWidth - 18;
    sizes.messageHeight = sizes.boxHeight - 30;
    sizes.buttonsTop = -((sizes.boxHeight / 2) - 12);
    sizes.buttonsLabelsTop = sizes.buttonsTop - 2;

    // Prepare by making the interface.
    let ui = this.app.uiFacade.build(this.app, type, 2, '|' + players.join('|'));

    ui.global({
      title: title,
      iconstyle: iconstyle,
      iconsubstyle: iconsubstyle,
      text: message,
      actions: actions,
      buttonText: buttonText,
      sizes: sizes
    });
    ui.timeout = 0;
    ui.hideClick = true;

    players.forEach((login) => {
      ui.player(login);
    });
    return ui;
  }
}
