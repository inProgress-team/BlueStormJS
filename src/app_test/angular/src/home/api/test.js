
module.exports = function(app) {
    app.get('/aa', function *(next) {
        this.body = 'not connected';
    });
    app.get('/bb', function *(next) {
        this.body = 'connected';

    });

};