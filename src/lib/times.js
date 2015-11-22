
var sprintf = require('sprintf-js').sprintf;

module.exports = {};
module.exports.getStringTime = function(numberTime) {
    "use strict";

    let min = Math.floor(numberTime / (1000*60));
    let sec = Math.floor((numberTime - min * 60 * 1000) / 1000);
    let msec = (numberTime+"").substr((numberTime+"").length - 3);

    if(msec) {
        return sprintf('%02d:%02d.%03d', min, sec, msec);
    }
    return sprintf('%02d:%02d', min, sec);
};