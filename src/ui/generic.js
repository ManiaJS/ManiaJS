/**
 * ManiaJS Generic GUI Elements.
 */
'use strict';

/**
 * Generic Interface Helper.
 *
 * @class GenericInterface
 */
export default class {

  constructor (app, facade) {
    this.app = app;
    this.facade = facade;
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
    button = button || 'OK';
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
    let ui = this.app.uiFacade.build(this.app, 'alert', 2);

    ui.global({
      title: title,
      iconstyle: iconstyle,
      iconsubstyle: iconsubstyle,
      text: message,
      action: 'core_alert_normal',
      buttontext: button,

      // Size
      sizes: sizes,
    });

    ui.timeout = 0;
    ui.hideClick = true;

    players.forEach((login) => {
      ui.player(login);
    });

    return ui;
  }
}
