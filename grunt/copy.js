'use strict';

module.exports = {
  default: {
    files: [
      {
        expand: true, cwd: 'src', src: ['**/*', '!**/*.ts'], dest: 'lib/', filter: 'isFile'
      }
    ]
  },
  test: {
    files: [
      {
        cwd: 'test/files',
        src: 'config-*.yaml',
        dest: './',
        expand: true
      }
    ]
  }
};
