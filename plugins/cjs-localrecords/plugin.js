
module.exports = {};

module.exports.pluginInfo = {
    id: 'cjs-localrecords',
    authors: [
        "Tom Valk <tomvalk@lt-box.info>"
    ],
    version: "1.0.0",
    description: "Local records",
    dependencies: ['cjs-chat'],
    requirements: ['cjs-chat']
};

module.exports.loadPlugin = function(pluginInterface, callback) {
    "use strict";
    //console.log(pluginInterface);
    callback();
};