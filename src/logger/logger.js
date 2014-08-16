var clc = require('cli-color'),
    errorC = clc.red.bold,
    infoC = clc.cyan,
    warnC = clc.magenta;

module.exports = {
    error: function(from, error) {
        console.error(errorC.underline.inverse('From '+from));
        console.error(errorC(error.stack));
    },
    info: function(message) {
        console.log(infoC(message));
    },
    warn: function(message) {
        console.log(warnC(message));
    }
}