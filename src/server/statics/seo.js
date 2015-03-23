var phridge = require('phridge'),
    redis = require("redis");

var TTL_CACHE_SEO = 60 * 60 * 24; //1 day

var htmlcleaner = require(__dirname+'/htmlcleaner'),
    status = require(__dirname+'/status');//,
    //translateSeo = require(__dirname+'/translate-seo');

var client = redis.createClient();


var bots = [
    //FACEBOOK
    'facebookexternalhit/1.http (+0://www.facebook.com/externalhit_uatext.php)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Facebot',

    //TWITTER
    'Twitterbot/1.0',

    //LINKEDIN
    'LinkedInBot/1.0 (compatible; Mozilla/5.0; Jakarta Commons-HttpClient/3.1 +http://www.linkedin.com)',

    //GOOGLE
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
    'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'SAMSUNG-SGH-E250/1.0 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Browser/6.2.3.3.c.1.101 (GUI) MMP/2.0 (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)',
    'DoCoMo/2.0 N905i(c100;TB;W24H16) (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)',


    //BING
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 530) like Gecko (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'msnbot/2.0b (+http://search.msn.com/msnbot.htm)',
    'msnbot-media/1.1 (+http://search.msn.com/msnbot.htm)',
    'adidxbot/1.1 (+http://search.msn.com/msnbot.htm)',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534+ (KHTML, like Gecko) BingPreview/1.0b',
    'Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 530) like Gecko BingPreview/1.0b',

    //YANDEX
    'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexImages/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexVideo/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexMedia/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexBlogs/0.99; robot; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexFavicons/1.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexWebmaster/2.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexPagechecker/1.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexImageResizer/2.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexDirect/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexDirect/2.0; Dyatel; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexMetrika/2.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexNews/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexCatalog/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexAntivirus/2.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexZakladki/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; YandexMarket/1.0; +http://yandex.com/bots)',

    //BAIDU
    'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
    'Mozilla/5.0 (Linux;u;Android 2.3.7;zh-cn;) AppleWebKit/533.1 (KHTML,like Gecko) Version/4.0 Mobile Safari/533.1 (compatible; +http://www.baidu.com/search/spider.html)',
    'Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.2.8;baidu Transcoder) Gecko/20100722 Firefox/3.6.8 ( .NET CLR 3.5.30729)',
    'Baiduspider+(+http://www.baidu.com/search/spider.htm)',
    'Baiduspider+(+http://www.baidu.com/search/spider_jp.html)',
    'BaiDuSpider',
    'Baiduspider',
    'Baiduspider-image+(+http://www.baidu.com/search/spider.htm)',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0; baidu Transcoder;)',

    //YAHOO
    'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
    'Mozilla/5.0 (compatible; Yahoo! Slurp China; http://misc.yahoo.com.cn/help.html)',
    'YahooSeeker/1.2 (compatible; Mozilla 4.0; MSIE 5.5; yahooseeker at yahoo-inc dot com ; http://help.yahoo.com/help/us/shop/merchant/)',

    //AOL
    'Mozilla/5.0 (compatible; MSIE 9.0; AOL 9.7; AOLBuild 4343.19; Windows NT 6.1; WOW64; Trident/5.0; FunWebProducts)',

    //ASK.COM
    'Mozilla/5.0 (compatible; Ask Jeeves/Teoma; +http://about.ask.com/en/docs/about/webmasters.shtml)',

    //W3C
    'W3C_Validator/1.3',
    'Validator.nu/LV',
    'W3C-checklink',
    'W3C-mobileOK/DDC-1.0',
    'W3C_I18n-Checker/1.0',
    'NING/1.0',
    'FeedValidator/1.3',
    'Jigsaw/2.3.0 W3C_CSS_Validator_JFouffa/2.0',
    'W3C_Unicorn/1.0',



    //MISC
    'iaskspider/2.0(+http://iask.com/help/help_index.html)',
    'Mozilla/5.0 (compatible; OrangeBot/2.0; support.orangebot@orange.com)'
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

        client.select(15, function(err) {
            if (err)
                res.send();

            client.get(url, function(err, result) {
                if (err)
                    return res.send(err);



                if (result) {
                    res.status(status.get(result));
                    res.send(JSON.parse(result));
                }
                else {
                    exec("phantomjs node_modules/bluestorm/phantom.js "+url, function (error, stdout, stderr) {
                        if(stdout) {
                            htmlcleaner.clean(stdout, function(html) {
                                //html = translateSeo.translate(html, 'fr');

                                
                                client.set(url, JSON.stringify(html));
                                client.expire(url, TTL_CACHE_SEO);

                                res.status(status.get(html));
                                res.set('Content-Type', 'text/html');
                                res.send(html);

                            });
                        }
                    });
                }
            });
        });
    }
};