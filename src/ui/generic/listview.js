/**
 * List View
 */
'use strict';

import { EventEmitter } from 'events';


/**
 * List View
 *
 * @class ListView
 *
 * @property {App} app
 * @property {string} title Title of list.
 * @property {Player} player Player Login (single login!).
 * @property {[{name: {string}, field: {string}, width: {number}, [level]: {number}, [event]: {string}}]} columns Columns to define.
 * @property {[{}]} data Array with objects. Give a custom manialink with the 'custom' key. This will be injected into the row!
 */
export default class extends EventEmitter {
  /**
   * Construct List View
   * @param {App} app
   * @param {string} title
   * @param {Player} player
   * @param {[{name: {string}, field: {string}, width: {number}, [level]: {number}, [event]: {string}}]} columns Columns to define.
   * @param {[{}]} data Array with objects. Give a custom manialink with the 'custom' key. This will be injected into the row!
   */
  constructor (app, title, player, columns, data) {
    super();
    this.setMaxListeners(0);

    this.app = app;

    this.title = title;
    this.player = player;
    this.columns = columns;
    this.data = data;

    this.ui = this.app.uiFacade.build(this.app, 'list', 2, true);

    this.range = {
      start: 0,
      stop: 15
    };
  }

  /**
   * Parse Data and Columns and Prepare the UI. Must be called before the display or update command!
   */
  parse () {
    this.width      = 210;
    this.totalWidth = 0;

    this.page    = 0; // Current Page NR.
    this.numRows = this.data.length; // Total Rows data
    this.numCols = this.columns.length; // Total Columns.

    this.header  = []; // Contains Headers, ready for view.
    this.body    = []; // Contains Body, ready for view.
    this.events  = []; // Possible events, we use a | to separate from the index of the record!

    this.send    = {}; // Will be the data to send to the view.

    // Create header for player.
    var left = 0; // Current left position
    this.columns.forEach((raw) => {
      if (raw.hasOwnProperty('level') && this.player.level < raw.level) {
        return; // Skip, the player has no rights for this col!
      }
      if (raw.hasOwnProperty('event')) {
        this.events.push(raw.event);
      }
      this.totalWidth += raw.width;

      raw.left = (left + 2);
      left += raw.width;
      raw.sepLeft = left; // TODO: ? separator?


      this.header.push(raw);
    });

    // Update number of cols.
    this.numCols = this.header.length;

    if (this.totalWidth > this.width) {
      throw new Error('Total Column Width is greater than the maximum of '+width+'!');
    }


    // Current page, items.
    var pageItems = 0;

    // Make body!
    this.data.forEach((rawRow, rowIdx) => {
      // Current left position
      var left = 0;

      // Reset page items if on new page.
      if (pageItems === 15) {
        pageItems = 0;
      }

      // Row data.
      let row = {data: [], top: (pageItems * 6), even: (pageItems % 2 === 1)};

      this.header.forEach((rawCol, colIdx) => {
        if (rawCol.field && ! rawRow.hasOwnProperty(rawCol.field)) {
          this.app.log.warn('List View: Data has no field as defined in column!');
          return;
        }
        let col = {};

        // Text/ManiaLink/button
        col.text = '';

        let text = rawRow.hasOwnProperty(rawCol.field) ? rawRow[rawCol.field] : '';

        if (rawCol.hasOwnProperty('custom') && rawCol.custom) {
          // Custom MANIALINK!;
          col.text = false;
          col.button = false;
          col.custom = text;
        } else if (rawCol.hasOwnProperty('button') && rawCol.button) {
          col.custom = false;
          col.text = false;
          col.button = true;

          col.style = rawCol.style || 'Icons64x64_1';
          col.substyle = rawCol.substyle || 'LvlRed';
        } else {
          col.text = text;
          col.custom = false;
          col.button = false;
        }

        // Event
        if (rawCol.hasOwnProperty('event') && rawCol.event) {
          col.event = 'action="' + rawCol.event + '|' + rowIdx + '"';
        } else {
          col.event = '';
        }

        // Width and height
        col.width = rawCol.width;
        col.height = 5;

        // Position
        col.left = left + 2;
        col.top = (pageItems * 6);

        left += col.width;

        // Add to row
        row.data.push(col);
      });

      // Add to body
      this.body.push(row);

      // Page Items
      pageItems++;
    });

    // Calculate total pages.
    this.numRows = this.body.length;
    this.pages = Math.ceil( this.numRows / 15 );

    // Prepare the UI.
    this.prepare();
  }

  /**
   * Prepare the UI.
   */
  prepare () {
    this.ui.timeout = 0;
    this.ui.hideClick = false;

    this.ui.global({
      title: this.title,
      header: this.header,
      body: this.body.slice(this.range.start, this.range.stop),

      page: this.page + 1,
      pages: this.pages,
      total: this.numRows,
      range: {
        start: this.range.start + 1,
        stop: this.range.stop
      },

      next: this.page < this.pages,
      prev: this.page > 0
    });

    this.ui.player(this.player.login);

    // Callbacks on every event that we have.
    this.events.forEach((event) => {
      this.ui.on(event, (params) => {
        this.handle (event, params);
      });
    });

    // View Handlers.
    this.ui.on('close',     (params) => this.handleClose(params.login));

    this.ui.on('first',     (params) => this.handleFirst(params.login));
    this.ui.on('prev_10',   (params) => this.handlePrev(params.login, 10));
    this.ui.on('prev',      (params) => this.handlePrev(params.login, 1));
    this.ui.on('next',      (params) => this.handleNext(params.login, 1));
    this.ui.on('next_10',   (params) => this.handleNext(params.login, 10));
    this.ui.on('last',      (params) => this.handleLast(params.login));
  }

  /**
   * Handle Close Button.
   */
  handleClose (login) {
    if (this.player.login === login) {
      this.close();
    }
  }

  handleLast (login) {
    if (this.player.login !== login) {
      return;
    }
    this.page = this.pages;
    this.range.start = (15 * this.pages) - 15;
    this.range.stop  = (15 * this.pages);
    this._pageUpdate();
  }

  handleFirst (login) {
    if (this.player.login !== login) {
      return;
    }
    this.page = 0;
    this.range.start = 0;
    this.range.stop  = 15;
    this._pageUpdate();
  }

  handleNext (login, skip) {
    if (this.player.login !== login) {
      return;
    }
    if ((this.page + skip) > this.pages) {
      return false;
    }
    this.range.start += (15 * skip);
    this.range.stop  += (15 * skip);
    this.page += skip;

    this._pageUpdate();
  }

  handlePrev (login, skip) {
    if (this.player.login !== login) {
      return;
    }
    if ((this.page - skip) < 0) {
      return false;
    }
    this.range.start -= (15 * skip);
    this.range.stop  -= (15 * skip);
    this.page -= skip;

    this._pageUpdate();
  }

  /**
   * Update Page, send new slice to client!
   * @returns {Promise}
   * @private
   */
  _pageUpdate() {
    // Change page, change the slice!
    return this.ui.global({
      title: this.title,
      header: this.header,
      body: this.body.slice(this.range.start, this.range.stop),

      page: this.page + 1,
      pages: this.pages,
      total: this.numRows,
      range: {
        start: this.range.start + 1,
        stop: this.range.stop
      },

      next: this.page < this.pages,
      prev: this.page > 0
    }).update();
  }


  /**
   * List Event Handler.
   *
   * @param {string} event
   * @param {{}}     params
   */
  handle (event, params) {
    if (params.answer.indexOf('|') === -1) {
      return false;
    }

    // Parse
    let idx = parseInt(params.answer.substr(params.answer.indexOf('|') + 1));
    if (! isNaN(idx) && this.data.length > idx) {
      let row = this.data[idx];

      // Emit
      this.emit(event, {idx: idx, entry: row});
    }
  }


  /**
   * Start displaying to player.
   *
   * @returns {Promise}
   */
  display () {
    return this.ui.display();
  }

  /**
   * Stop displaying to player.
   *
   * @returns {Promise}
   */
  close () {
    // Send empty manialink to the player with the same ID.
    return this.ui.destroy();
  }

  /**
   * Get UI instance.
   * @returns {InterfaceBuilder}
   */
  toUI () {
    return this.ui;
  }
}
