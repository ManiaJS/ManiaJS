'use strict';

module.exports = function (grunt, options) {
  return {
    package: grunt.file.readJSON('package.json')
  };
};
