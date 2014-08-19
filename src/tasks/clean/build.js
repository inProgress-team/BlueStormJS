var fse = require('fs-extra');


module.exports = {
    development: function(cb) {
        build.build('build', cb);
    },
    production: function(cb) {
        build.build('bin', cb);
    },
    build: function(dir, cb) {
        fse.remove('dist/'+dir, cb);
    }
};
var build = module.exports;