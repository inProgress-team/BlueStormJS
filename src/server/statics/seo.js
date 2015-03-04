var phridge = require('phridge'),
    redis = require("redis");

var htmlcleaner = require(__dirname+'/htmlcleaner'),
    translateSeo = require(__dirname+'/translate-seo');

var client = redis.createClient();


var bots = [
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Facebot',
    'Googlebot',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    'Googlebot-News',
    'Googlebot-Image/1.0',
    'Googlebot-Video/1.0',
    '(compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)',
    '(compatible; Mediapartners-Google/2.1; +http://www.google.com/bot.html)',
    'Mediapartners-Google',
    'AdsBot-Google (+http://www.google.com/adsbot.html)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 530) like Gecko (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
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