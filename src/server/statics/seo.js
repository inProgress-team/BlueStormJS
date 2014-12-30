var phridge = require('phridge'),
    redis = require("redis");

var htmlcleaner = require(__dirname+'/htmlcleaner');

var client = redis.createClient();

module.exports = {
    middleware: function(req, res, next) {

        var fragment = req.query._escaped_fragment_,
            userAgent = req.headers['user-agent'];

        if(userAgent!='facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'&&userAgent!='facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'&&userAgent!='Facebot') {
            if(fragment===undefined||typeof fragment!='string')
                return next();
        }

        if(fragment=='')
            fragment = '/';
        else if(fragment===undefined) {
            fragment = req.originalUrl;
        }


        var url = 'http://'+req.headers.host+fragment;

        var exec = require('child_process').exec;

        /*client.select(15, function(err) {
            if (err)
                res.send();

            client.get(url, function(err, result) {
                if (err)
                    return res.send(err);

                if (result) {
                    res.send(JSON.parse(result));
                }
                else {*/
                    exec("phantomjs node_modules/bluestorm/phantom.js "+url, function (error, stdout, stderr) {
                        if(stdout) {
                            htmlcleaner.clean(stdout, function(html) {
                                //client.set(url, JSON.stringify(html));
                                res.set('Content-Type', 'text/html');
                                res.send(html);
                            });
                        }
                    });/*
                }
            });
        });*/
    }
};