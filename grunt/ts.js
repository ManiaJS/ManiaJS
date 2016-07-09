'use strict';

module.exports = {
  default: {
    tsconfig: true,

    files: [
      {
        src: ['src/**.ts', 'src/*/**.ts'],
        dest: 'lib'
      }
    ]
  }
};
