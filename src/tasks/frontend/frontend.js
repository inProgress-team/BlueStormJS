var html2js = require(__dirname+'/angular/html2js/html2js'),
    async = require('async');

module.exports = {
    buildDev: function(cb) {
        async.parallel([
            html2js.buildDev

        ], cb);
    },
    buildProd: function(cb) {
        async.parallel([
            html2js.buildProd

        ], cb);
    }
};