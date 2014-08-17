var html2js = require(__dirname+'/angular/html2js');

module.exports = {
    buildDev: function(cb) {
        html2js.buildDev(function() {
            cb();
        });
    }
};