/**
 * Used to boot the controller
 *
 * Execute like this: 'node controller.js [arguments]'
 */
var program = require('commander');
var version = '0.0.1';

/** Init with CMD options */
program
  .version(version)
  .option('-v, --verbose', 'More information in logs')
  .parse(process.argv);

/** Load config */
var configuration = require('./src/lib/configuration');
try {
  configuration.validate();
} catch (err) {
  console.error("Error reading configuration (config.yaml):");
  console.error(err);
  process.exit(1);
}

/** Boot Controller */
require('./src/boot');
