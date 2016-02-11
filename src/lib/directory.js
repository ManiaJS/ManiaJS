var fs = require('fs');
var path = require('path');

module.exports = {
  rootPath: function () {
    return path.normalize(__dirname + "/../../");
  },
  srcPath: function () {
    return path.normalize(__dirname + "/../");
  },
  pluginsPath: function () {
    return path.normalize(__dirname + "/../../plugins/");
  },
  sep: path.sep
};
