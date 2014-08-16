var clc = require('cli-color'),
    moment = require('moment'),
    clear = require("cli-clear");

module.exports = {
    clear: function() {
        clear();
        console.log();
    },
    error: function(from, error) {
        console.error(clc.red.bold.underline.inverse('From '+from));
        console.error(clc.red.bold(error.stack));
    },
    info: function(message, style) {
        if(typeof style == 'string') style = clc[style];
        else if(typeof style == 'object' && style.length>0){
            var styles = style;
            style = clc[styles[0]];
            for(var i =1; i<styles.length; i++) {
                style = style[styles[i]];
            }
        } else {
            style = clc.green;
        }

        console.log(this.getTime()+style(message));
    },
    warn: function(message) {
        console.warn(this.getTime()+clc.yellow("[WARNING] "+message));
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