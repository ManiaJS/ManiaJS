
module.exports = {};

module.exports.pluginInfo = {
    id: 'cjs-chat',
    authors: [
        "Tom Valk <tomvalk@lt-box.info>"
    ],
    version: "1.0.0",
    description: "Chat handlers, In and output for chat access.",
    dependencies: [],
    requirements: []
};

module.exports.loadPlugin = function(pluginInterface, callback) {
    "use strict";
    //console.log(pluginInterface);
    setTimeout(function() {
        return callback(null);
    }, 200)
};