/**
 * Send anything to the MP Server.
 * Sending query builder.
 */

/**
 * Send
 * @class Send
 */
export default class {

  /**
   * Construct sending query instance.
   *
   * @param {App} app
   * @param {ServerClient} client
   */
  constructor(app, client) {
    this.app = app;
    this.client = client;

    // Contains the sending queue. (raw).
    this.query = {};
  }

  /**
   * Send chat message.
   *
   * @param {string} text
   * @param {object} options Optional options.
   * @param {string} options.source Source of message, could be 'player', 'server' or 'global' (default)
   * @param {string} options.destination Destination, false for all, string for login (default false).
   *
   * @return {self}
   */
  chat(text, options) {
    options = options || {};
    let source = options.source || 'global';
    let destination = options.destination || false;

    if (source === 'global') {
      if (! destination) {
        this.query = {
          query: 'ChatSendServerMessage',
          params: [text]
        }
      } else {
        this.query = {
          query: 'ChatSendServerMessageToLogin',
          params: [text, destination]
        }
      }
    }

    return this;
  }

  // TODO: make this proper!
  skip() {
    this.query = {
      query: 'NextMap'
    };
    return this;
  }


  /**
   * Execute builded query.
   *
   * @return {Promise|boolean}
   */
  exec() {
    if (! this.query.hasOwnProperty('query')) {
      return false;
    }
    let self = this;

    // Execute and return result (raw).
    return new Promise((resolve, reject) => {
      self.client.gbx.query(self.query.query, self.query.params, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
  }
}


