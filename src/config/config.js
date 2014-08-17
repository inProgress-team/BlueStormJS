module.exports = {
    getDestDir: function(params) {

        var dir = 'build'
        if(params.env=='production') {
            dir='bin';
        }
        return dir;
    },
    geti18nApps: function(params) {
        return ['desktop', 'admin']
    },
    getFrontendApps: function(params) {
        return ['desktop', 'admin']
    },
    getIncludes: function(params, cb) {

        console.log(params);
        cb(null, 'pluf');
    }
};