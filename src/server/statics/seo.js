var phridge = require('phridge'),
    redis = require("redis");

var htmlcleaner = require(__dirname+'/htmlcleaner'),
    translateSeo = require(__dirname+'/translate-seo');

var client = redis.createClient();


var bots = [
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Facebot',
    'Googlebot'
];


module.exports = {
    middleware: function(req, res, next) {

        var fragment = req.query._escaped_fragment_,
            userAgent = req.headers['user-agent'];

        if(bots.indexOf(userAgent)==-1) {
            if(fragment===undefined||typeof fragment!='string') {
                return next();
            }
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
                                res.send(translateSeo.translate(html, 'fr'));
                            });
                        }
                    });/*
                }
            });
        });*/
    }
};