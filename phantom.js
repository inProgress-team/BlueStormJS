var page = require('webpage').create();

var system = require('system');
var args = system.args;
page.onError = function(msg, trace) {

    var msgStack = ['ERROR: ' + msg];

    /*if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
        });
    }*/

    //console.error(msgStack.join('\n'));
    //console.log('\n\n\n\n\n\n\n');

};
page.open(args[1], function() {
    wait(function (cb) {
        var res = page.evaluate(function () {
            if($('body').hasClass('ready') || true) {
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
            } else {
                return false;
            }
        });
        cb(res);
    }, function (res) { // onReady function
        console.log(res);
        phantom.exit();
    }, 5000);

});
function wait(testFx, onReady, maxWait, start) {
    var start = start || new Date().getTime()
    if (new Date().getTime() - start < maxWait) {
        testFx(function(result) {
            if (result) {
                onReady(result);
            } else {
                setTimeout(function() {
                    wait(testFx, onReady, maxWait, start);
                }, 250)
            }
        })
    } else {
        console.error('timed_out');
        phantom.exit()
    }
}