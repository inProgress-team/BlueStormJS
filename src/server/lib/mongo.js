var mongoose = require('mongoose'),
    arborescence = require(__dirname + '/../../arborescence');

module.exports = function(host) {
    mongoose.connect('localhost/assipe');

    console.log(host);

    arborescence.getRequiredFiles('models', function(files) {
        arborescence.loadFiles(files);
    });
};