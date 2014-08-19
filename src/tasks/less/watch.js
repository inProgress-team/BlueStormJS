var build = require(__dirname+'/build');

module.exports = {
    extensions: ['less'],
    update: function() {

    },
    delete: function() {
        watch.update();
    }
};
var watch = module.exports;