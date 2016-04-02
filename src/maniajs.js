/**
 * Used to boot the controller
 *
 * Execute like this: 'npm start [arguments]'
 */
'use strict';

import {Command} from 'commander';

// Import package.json information. This is used for getting version info.
import * as packageInfo from './../package.json';

// Configuration
import * as configuration from './util/configuration';

import boot from './boot';

/** Init with CMD options */
let program = new Command()
  .version(packageInfo.version)
  .option('-v, --verbose', 'More information in logs')
  .option('-c, --config [location]', 'Run with config file location given')
  .parse(process.argv);

/** Load config */
try {
  var configPath = null;
  if (typeof program.config === 'string') {
    configPath = program.config;
  } else if (process.env.hasOwnProperty('MJS_CONFIG_PATH')) {
    configPath = process.env.MJS_CONFIG_PATH;
  } else {
    configPath = null;
  }
  configuration.load(configPath);
  configuration.validate();
} catch (err) {
  console.error("Error reading configuration (config.yaml), you could try to provide custom configuration path with -c/--config [path]:");
  console.error(err);
  process.exit(1);
}

/** Boot Controller */
boot();
