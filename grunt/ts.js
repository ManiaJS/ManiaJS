'use strict';

module.exports = {
  default: {
    tsconfig: true,

    files: [
      {
        src: ['src/**.ts'],
        dest: 'lib'
      }
    ]
  }
};

let t = {
  files: [
    {
      src: ['src/**.ts'],
      dest: 'lib'
    },
    // { src: 'test/**.ts' , dest: 'lib/test' }
  ],

  options: {
    // tsconfig: __dirname + '/../../tsconfig.json',
    // fast: 'never',
    // module: 'es6',
    // target: 'es6'
  }
};
