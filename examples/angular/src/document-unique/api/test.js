
module.exports = function(app) {
    app.get('/document-unique', function *(next) {
        this.body = {
            go: 'YESS'
        };
    });
    app.get('/bb', function *(next) {
        this.body = 'connected';
    });
};