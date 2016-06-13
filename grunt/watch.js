'use strict';

module.exports = {
  ts: {
    files: [
      'src/**/*.ts',
      'src/**/*',
      'test/**/*.ts'
    ],
    tasks: ['clean:default', 'tslint', 'ts:default', 'copy:default']
  },
  test: {
    files: [
      'out/**/*.js'
    ],
    tasks: []
  }
};
