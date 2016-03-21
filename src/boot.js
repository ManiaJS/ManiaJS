/**
 * Boot.js
 *
 * Read out all the configs. register exit handlers. start logging.
 *
 * Then finally start ManiaJS.
 */
'use strict';

import Bunyan             from 'bunyan';
import PrettyStream       from 'bunyan-prettystream';

import App                from './app';


// Logger
var prettyOut = new PrettyStream();
    prettyOut.pipe(process.stdout);

var log = Bunyan.createLogger({
  name: 'maniajs',
  streams: [{
    level: 'debug',
    type: 'raw',
    stream: prettyOut
  }, {
    level: 'info',
    path:   __dirname + '/../log/application.log'
  }]
});
log.info('Starting ManiaJS...');


/** Add exit handlers */
function exitHandler(options, err) {
  if (options.cleanup) {
    log.info('ManiaJS is going to shutdown...');
    // TODO: Close db, server and plugins.
  }
  if (err) {
    log.error('Uncaught Exception', err.stack);
  }
  if (options.exit) {
    log.info('Will now close...');

    process.exit();
  }
}

// Start handlers for exitting.
process.on('exit',              exitHandler.bind(null, {cleanup: true}));
process.on('SIGINT',            exitHandler.bind(null, {exit: true}));
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));



/** Start ManiaJS */
let app = new App(log);

app.prepare()
  .then(()=>app.run())
  .catch((err)=>log.fatal(err));


/** Make sure we will resume executing process */
process.stdin.resume();
