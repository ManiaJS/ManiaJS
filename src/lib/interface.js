/**
 * Main Plugin Interface
 * Used to interact with plugins, client and configuration from plugins itself
 *
 * @author Tom Valk <tomvalk@lt-box.info>
 *
 */
module.exports = {};

module.exports.client = require('./client').client;
module.exports.config = require('./configuration');
module.exports.plugin = require('./plugin');

