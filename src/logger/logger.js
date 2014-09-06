var clc = require('cli-color'),
    moment = require('moment');

var gutil = require('gulp-util');

var dbConnection = require(__dirname+'/../db/db'),
    db = null;


dbConnection(function(err, database) {
    if(err) return console.log(err);
    db = database;
});


module.exports = {
    error: function(error, from, params) {
        console.error(clc.red.bold.underline.inverse('From '+from));
        if(params!==undefined&&!params.stack) {
            console.error(clc.red(error));
        } else {
            console.error(clc.red(error.stack));
        }

        this.addLog(error);

    },
    warn: function() {
        console.warn(clc.yellow("[WARNING] ")+this.getMessage(arguments));
    },
    getStyledMessage: function(message, styles) {
        var style = clc;
        for(var i in styles) {
            if(gutil.colors[styles[i]])
                style = style[styles[i]];
        }

        return style(message);
    },
    getMessage: function(arguments, unstyled) {
        var res = "",
            unstyled = "";

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
                unstyled += arg;
            }
        }

        if(unstyled!==undefined) {
            return unstyled;
        }
        return res;

    },
    log: function() {//message, params
        console.log(this.getMessage(arguments));

        var message = this.getMessage(arguments);
        this.addLog(message);
        
    },
    addLog: function (message) {
        //if(process.env.NODE_ENV=='production') {
            if(db) {
                db.collection('logs').insert({
                    "log": message,
                    "releaseDate": new Date
                }, function(){});    
            }
            
        //}
    },
    getLogs: function () {
        setTimeout(function () {
            if(db) {
                db.collection('logs').find({}).toArray(function(err, results){
                    if(err) return console.log(err);
                    for(var i in results) {
                        console.log(results[i].log);
                    }
                });
            }
        }, 500);
    },
    dump: function() {
        console.log(arguments);
    }
}