var mongoose = require('mongoose'),
    arborescence = require(__dirname + '/../../arborescence');

module.exports = function(host) {
    mongoose.connect(host);

    arborescence.getRequiredFiles('models', function(files) {
        arborescence.loadFiles(files);
    });
};