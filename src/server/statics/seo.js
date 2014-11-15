var phridge = require('phridge');

var htmlcleaner = require(__dirname+'/htmlcleaner');


module.exports = {
    middleware: function(req, res, next) {

        var shell = require('shell');

        var fragment = req.query._escaped_fragment_,
            userAgent = req.headers['user-agent'];

        console.log(userAgent);
        if(userAgent!='facebookexternalhit/1.0'&&userAgent!='facebookexternalhit/1.1'&&userAgent!='Facebot') {
            if(fragment===undefined||typeof fragment!='string')
                return next();
        }

        if(fragment=='')
            fragment = '/';

        var url = 'http://'+req.headers.host+fragment;

        var sys = require('sys');
        var exec = require('child_process').exec;

        exec("phantomjs node_modules/bluestorm/phantom.js "+url, function (error, stdout, stderr) {

            if(stdout) {
                htmlcleaner.clean(stdout, function(html) {
                    res.set('Content-Type', 'text/html');
                    res.send(html);
                });
            }

            /*sys.print('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }*/
        });

    }
};




/*
 phridge.spawn({
 loadImages: false,
 remoteDebuggerPort: 9000
 })
 .then(function (phantom) {
 return phantom.openPage();
 })
 .then(function (page) {
 return page.run('body.ready', function (selector, resolve, reject) {
 // this function runs inside PhantomJS bound to the webpage instance


 /*
 var page = this;
 // custom helper function
 function wait(testFx, onReady, maxWait, start) {
 var start = start || new Date().getTime()
 if (new Date().getTime() - start < maxWait) {
 testFx(function(result) {
 if (result) {
 onReady()
 } else {
 setTimeout(function() {
 wait(testFx, onReady, maxWait, start)
 }, 250)
 }
 })
 } else {
 reject(new Error("search timed out."));
 }
 };

 wait(function (cb) {
 var res = page.evaluate(function () {
 // check if something is on the page (should return true/false)
 return $('body').hasClass('ready');
 });
 console.log(res);
 cb(res);
 }, function () { // onReady function
 console.log('ok');
 }, 5000);
 *//*


 var page = this,
 delay=0;
 var DELAY = 1000,
 MAX_DELAY = 10000;
 var intervalId = setInterval(function () {

 /*var test = page.evaluate(function (selector) {
 return $('body').hasClass('ready');
 }, 'body.navbar-left');
 console.log(JSON.stringify(test));
 delay = delay+DELAY;
 return;
 *//*


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
 reject(new Error( selector + " search timed out."));
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