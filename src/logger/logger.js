var clc = require('cli-color'),
    moment = require('moment'),
    clear = require("cli-clear");

var gutil = require('gulp-util');

module.exports = {
    error: function(error, from, params) {
        gutil.log(clc.red.bold.underline.inverse('From '+from));
        if(params!==undefined&&!params.stack) {
            gutil.log(clc.red(error));
        } else {
            console.error(clc.red(error.stack));
        }

    },
    warn: function(message) {
        console.warn(this.getTime()+clc.yellow("[WARNING] "+message));
    },
    getStyledMessage: function(message, styles) {
        for(var i in styles) {
            if(gutil.colors[styles[i]])
                message = gutil.colors[styles[i]](message);
        }

        return message;
    },
    getMessage: function(arguments) {
        var res = "";

        for(var i=0; i<arguments.length; i++) {
            var arg = arguments[i];

            if(typeof arg=='string' || typeof arg=='number') {
                var styles=[];
                //if next argument indicates style
                var nextArg = arguments[i+1];
                if(typeof nextArg=='object') {
                    styles= nextArg;
                    i++;
                }
                res+= this.getStyledMessage(arg, styles);
            }
        }

        return res;

    },
    log: function() {//message, params
        var msg = this.getMessage(arguments);
        gutil.log(msg);
    },
    dump: function() {
        console.log(arguments);
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