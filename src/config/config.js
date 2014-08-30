var frontConf = require(process.cwd()+'/config/frontend.json'),
    backConf = require(process.cwd()+'/config/backend.json');

module.exports = {
    frontend: {
        list: function() {
            var res = [];
            for (var key in frontConf) {
                res.push(key);
            }
            return res;
        },
        get: function(name) {
            return frontConf[name];
        }
    },
    backend: {
        get: function(name) {
            return backConf[name];
        }
    }
};