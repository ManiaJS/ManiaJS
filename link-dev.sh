#!/usr/bin/env bash

# Link local development environment
# Make sure that you clone the plugins repo in ../plugins

# First, update all plugins (npm update)
cd ../plugins
npm run update-all

# Link plugins
cd ../core

npm link ../plugins/packages/maniajs-admin
npm link ../plugins/packages/maniajs-cpdifference
npm link ../plugins/packages/maniajs-localrecords
npm link ../plugins/packages/maniajs-help
npm link ../plugins/packages/maniajs-jukebox
npm link ../plugins/packages/maniajs-karma
npm link ../plugins/packages/maniajs-mapwidget
npm link ../plugins/packages/maniajs-welcome
