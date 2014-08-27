var clc = require('cli-color'),
    moment = require('moment'),
    clear = require("cli-clear");

module.exports = {
    clear: function() {
        //clear();
        console.log('\n');
    },
    error: function(from, error, params) {
        console.error(clc.red.bold.underline.inverse('From '+from));
        if(params!==undefined&&!params.stack) {
            console.error(clc.red(error));
        } else {
            console.error(clc.red(error.stack));
        }

    },
    warn: function(message) {
        console.warn(this.getTime()+clc.yellow("[WARNING] "+message));
    },
    info: function() {//message, params
        //console.log(arguments.length);
        //console.log();
        var countMessage = parseInt(arguments.length/2, 10);
        for(var i=0;i<countMessage; i++) {
            var p = getParams(arguments[2*i+1]);
            console.log(this.getTime()+ p.style[p.color](p.prefix+arguments[2*i]));
        }
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


function getParams(params) {
    var prefix = "",
        style = clc,
        level = 0,
        color = 'cyan';


    if(params!==undefined) {
        if (params.level) {
            level = params.level;
            switch (level) {
                case 1:
                    prefix = "";
                    style = style.inverse;
                    if (!params.color) {
                        color = 'blue';
                    }
                    break;
                case 2:
                    prefix = "-- ";
                    if (!params.color) {
                        color = 'yellow';
                    }
                    break;
                case 3:
                    prefix = "   * ";
                    if (!params.color) {
                        color = 'magenta';
                    }
                    break;
                case 4:
                    prefix = "        ";
                    if (!params.color) {
                        color = 'green';
                    }
                    break;
                case 5:
                    prefix = "          - ";
                    if (!params.color) {
                        color = 'blue';
                    }
                    break;
            }
        }
        if (params.color) {
            color = params.color;
        }
        if(params.styles!=undefined) {
            for(var i in params.styles) {
                style = style[params.styles[i]];
            }
        }
    }
    return {
        style: style,
        color: color,
        prefix: prefix
    }
}