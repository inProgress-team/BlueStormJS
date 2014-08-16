var server = require(__dirname+'/../server/server')


module.exports = {
    development: function() {
        this.buildProd();
        //server.devStart();
    },
    buildProd: function() {
        console.log('a');
    }
};