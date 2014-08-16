var clc = require('cli-color'),
    errorC = clc.red.bold,
    infoC = clc.cyan,
    warnC = clc.magenta;

var moment = require('moment'),
    configWebApp = require(process.cwd()+'/app/config');
moment.locale(configWebApp.lang);

module.exports = {
    error: function(from, error) {
        console.error(errorC.underline.inverse('From '+from));
        console.error(errorC(error.stack));
    },
    info: function(message) {
        console.log(this.getTime()+infoC(message));
    },
    warn: function(message) {
        console.log(this.getTime()+warnC(message));
    },
    getTime: function() {
        var m = moment(),
            seconds = m.seconds();
        if(seconds<10) {
            seconds = "0"+seconds;
        }
        return m.format('LL')+ m.format(', h:mm:ss a') +' ';
    }
}