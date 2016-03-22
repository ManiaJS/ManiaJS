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

/** Start ManiaJS */
let app = new App(log);

/** Set Error and exit handlers */
function exitHandler(options) {
  if (options.cleanup) {
    log.info('ManiaJS is going to shutdown...');
    app.exit();
  }
  if (options.error)
    log.error('Uncaught Exception: ', options.error.stack);
  if (options.exit) {
    //process.exit();
  }
}
process.on('exit',              (   ) => exitHandler({cleanup: true}));
process.on('SIGINT',            (   ) => exitHandler({exit   : true}));
process.on('uncaughtException', (err) => exitHandler({error  : err}));

/** Start ManiaJS */
app.prepare()
  .then(()=>app.run())
  .catch((err)=>log.fatal(err));

/** Make sure we will resume executing process */
process.stdin.resume();
