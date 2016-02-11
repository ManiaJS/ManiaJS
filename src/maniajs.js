/**
 * Used to boot the controller
 *
 * Execute like this: 'npm start [arguments]'
 */
'use strict';

import {Command} from 'commander';
import * as process from 'process';

// Import package.json information. This is used for getting version info.
import * as packageInfo from './../package.json';

// Configuration
import * as configuration from './util/configuration';

/** Init with CMD options */
new Command()
  .version(packageInfo.version)
  .option('-v, --verbose', 'More information in logs')
  .parse(process.argv);

/** Load config */
try {
  configuration.validate();
} catch (err) {
  console.error("Error reading configuration (config.yaml):");
  console.error(err);
  process.exit(1);
}

/** Boot Controller */
import './boot';
