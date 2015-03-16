var fs = require('fs'),
    beautify = require('js-beautify').html,
    cheerio = require('cheerio'),
    clean = JSON.parse(fs.readFileSync('config/seo/phantomjs-clean.json', 'utf8'));

var classRemove = [
    'ng-scope',
    'ng-model',
    'ng-binding',
    'ng-isolate-scope',
    'ng-hide'
].concat(clean.classRemove);

var attrsRemove = [
    'ng-repeat',
    'ng-app',
    'ng-controller',
    'ng-bind',
    'ng-class',
    'ng-include',
    'ng-href',
    'ng-show',
    'ng-if',
    'ui-view',
    'ng-transclude',
    'ng-click',
    'ng-style',
    'ng-model',
    'ng-change',
    'ng-src',
    'ondragstart',
    'ondrop',
    "ui-sref",
    "ui-sref-active",
    "autoscroll",

    "tooltip",
    "tooltip-placement",
    "dropdown",
    "translate"
].concat(clean.attrsRemove);

var elemsRemove = [
    'script',
    'style'
].concat(clean.elemsRemove);;

module.exports = {
    clean: function(data, callback) {

        var html = data,
            $this = this;

        /*html = */
        $this.custom(html, function(html) {
            html = $this.beautify(html);
            callback(html);
        });




    },
    beautify: function(html) {
        return beautify(html, {
            indent_size: 4,
            indent_inner_html: true,
            preserve_newlines: false
        });



    },
    custom: function(html, cb) {

        $ = cheerio.load(html);

        for(var i in classRemove) {
            $('.'+classRemove[i]).removeClass(classRemove[i])
        }
        //Remove useless attrs
        for(var i in attrsRemove) {
            $('['+attrsRemove[i]+']').removeAttr(attrsRemove[i])
        }

        //Remove useless tags
        for(var i in elemsRemove) {
            $(elemsRemove[i]).remove();
        }

        //Remove comments
        $('*').contents().each(function() {
            if(this.nodeType == 8) {
                $(this).remove()
            }
        });

        //Add a blank image if not
        $('img[src=""]').attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');

        $("[class='']").removeAttr('class');

        $('script').remove();

        cb($.html());

        return;
    }
};
