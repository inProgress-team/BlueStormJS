module.exports = {
    getDestDir: function(params) {

        var dir = 'build'
        if(params.env=='production') {
            dir='bin';
        }
        return dir;
    },
    getFrontendApps: function(params) {
        return ['desktop']
    },
    getIncludes: function(params, cb) {
        cb(null, 'pluf');
    }
};