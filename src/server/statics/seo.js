var phridge = require('phridge');

var htmlcleaner = require(__dirname+'/htmlcleaner');


module.exports = {
    middleware: function(req, res, next) {



        var fragment = req.query._escaped_fragment_;
        if(fragment===undefined||typeof fragment!='string')
            return next();

        if(fragment=='')
            fragment = '/';

        phridge.spawn({
            loadImages: false
        })
        .then(function (phantom) {
            return phantom.openPage('http://'+req.headers.host+fragment);
        })
        .then(function (page) {
            return page.run('.ready', function (selector, resolve, reject) {
                // this function runs inside PhantomJS bound to the webpage instance
                var page = this,
                    delay=0;
                var DELAY = 1000,
                    MAX_DELAY = 10000;
                var intervalId = setInterval(function () {
                    var hasBeenFound = page.evaluate(function (selector) {
                        return Boolean(document.querySelector(selector));
                    }, selector);

                    if (hasBeenFound === false && delay<MAX_DELAY) {
                        delay = delay+DELAY;
                        // wait for next interval
                        return;
                    }

                    clearInterval(intervalId);
                    if (hasBeenFound) {
                        var document = page.evaluate(function () {
                            var doctype = ''
                                , html = document && document.getElementsByTagName('html');
                            if(document.doctype) {
                                doctype = "<!DOCTYPE "
                                    + document.doctype.name
                                    + (document.doctype.publicId ? ' PUBLIC "' + document.doctype.publicId + '"' : '')
                                    + (!document.doctype.publicId && document.doctype.systemId ? ' SYSTEM' : '')
                                    + (document.doctype.systemId ? ' "' + document.doctype.systemId + '"' : '')
                                    + '>';
                            }

                            if (html && html[0]) {
                                return doctype + html[0].outerHTML;
                            }
                            return '';
                        });

                        resolve(document);
                    } else {
                        reject(new Error( selector + "search timed out."));
                    }
                }, DELAY);
            });
        })
        .then(function (content) {
                console.log(content);
            htmlcleaner.clean(content, function(html) {
                res.set('Content-Type', 'text/html');
                res.send(html);
            });


        })
        .catch(function (err) {
                // element has not been found
            res.send(err);
        });
        /*ph.createPage(function (page) {
            page.set('onConsoleMessage', function (msg) { // Détection des événements console
                console.log(''+msg);
            });
            console.log('opening http://'+req.headers.host+fragment);
            page.open('http://'+req.headers.host+fragment, function (status) {
                if(status!='success') {
                    return console.log('Page error');
                }
                console.log(status);
                var content = page.evaluate(function () { // Evaluation de la page par PhantomJS, ici on est dans un contexte client
                    console.log('evaluating...');
                    var doctype = ''
                        , html = document && document.getElementsByTagName('html');

                    if(document.doctype) {
                        doctype = "<!DOCTYPE "
                            + document.doctype.name
                            + (document.doctype.publicId ? ' PUBLIC "' + document.doctype.publicId + '"' : '')
                            + (!document.doctype.publicId && document.doctype.systemId ? ' SYSTEM' : '')
                            + (document.doctype.systemId ? ' "' + document.doctype.systemId + '"' : '')
                            + '>';
                    }

                    if (html && html[0]) {
                        console.log('Content found !');
                        return {
                            html: doctype + html[0].outerHTML
                        };
                    }
                });

            })
            page.set('onResourceRequested', function(request) {
                console.log('Request ' + JSON.stringify(request, undefined, 4));
            });
        });
         */

    }
};
function waitFor ($config) {
    $config._start = $config._start || new Date();

    if ($config.timeout && new Date - $config._start > $config.timeout) {
        if ($config.error) $config.error();
        if ($config.debug) console.log('timedout ' + (new Date - $config._start) + 'ms');
        return;
    }

    if ($config.check()) {
        if ($config.debug) console.log('success ' + (new Date - $config._start) + 'ms');
        return $config.success();
    }

    setTimeout(waitFor, $config.interval || 0, $config);
}